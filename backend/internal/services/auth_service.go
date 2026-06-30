package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/saura/daemonboard/backend/internal/domain/models"
	"github.com/saura/daemonboard/backend/internal/domain/repository"
	"github.com/saura/daemonboard/backend/internal/utils"
)

type AuthService interface {
	Register(ctx context.Context, username, email, password, ip, ua string) (*models.User, string, string, error)
	Login(ctx context.Context, username, password, ip, ua string) (*models.User, string, string, error)
	VerifyEmail(ctx context.Context, token, ip, ua string) error
	RefreshToken(ctx context.Context, refreshTokenStr, ip, ua string) (string, string, error)
	ForgotPassword(ctx context.Context, email, ip, ua string) error
	ResetPassword(ctx context.Context, token, newPassword, ip, ua string) error
	GetCurrentUser(ctx context.Context, userID uuid.UUID) (*models.User, error)
	GetAuditLogs(ctx context.Context, requesterID uuid.UUID) ([]models.AuditLog, error)
}

type DefaultAuthService struct {
	repo      repository.UserRepository
	jwtSecret string
}

func NewAuthService(repo repository.UserRepository, jwtSecret string) AuthService {
	return &DefaultAuthService{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *DefaultAuthService) Register(ctx context.Context, username, email, password, ip, ua string) (*models.User, string, string, error) {
	// 1. Check if user already exists
	existingUser, err := s.repo.GetUserByUsername(username)
	if err != nil {
		return nil, "", "", err
	}
	if existingUser != nil {
		return nil, "", "", errors.New("username is already taken")
	}

	existingEmail, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return nil, "", "", err
	}
	if existingEmail != nil {
		return nil, "", "", errors.New("email is already registered")
	}

	// 2. Hash password
	pwdHash, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to hash password: %w", err)
	}

	// 3. Setup user parameters
	userID := uuid.New()
	verificationToken := uuid.New().String()

	// Assign first user as Administrator, others as Developer
	role := "Developer"
	// Check if this is the first user in the database
	logs, err := s.repo.GetAuditLogs() // Simple heuristic: if no logs, or we can count users. Let's try counting or check logs.
	if err == nil && len(logs) == 0 {
		role = "Administrator"
	}

	avatarURL := fmt.Sprintf("https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=150&h=150&q=80",
		map[string]string{
			"Administrator": "1535713875002-d1d0cf377fde",
			"Developer":     "1570295999919-56ceb5ecca61",
		}[role])

	if avatarURL == "" {
		avatarURL = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
	}

	user := &models.User{
		ID:                userID,
		Username:          username,
		Email:             email,
		PasswordHash:      pwdHash,
		Role:              role,
		IsVerified:        false,
		VerificationToken: verificationToken,
		AvatarURL:         avatarURL,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	// 4. Save User to DB
	if err := s.repo.CreateUser(user); err != nil {
		return nil, "", "", fmt.Errorf("failed to save user: %w", err)
	}

	// 5. Generate Access & Refresh Tokens
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.Email, user.Role, s.jwtSecret)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshTokenStr, err := utils.GenerateRefreshToken()
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// 6. Save Refresh Token
	rt := &models.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		Token:     refreshTokenStr,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
	}
	if err := s.repo.SaveRefreshToken(rt); err != nil {
		return nil, "", "", fmt.Errorf("failed to save refresh token: %w", err)
	}

	// 7. Record registration audit log
	_ = s.repo.CreateAuditLog(&models.AuditLog{
		ID:        uuid.New(),
		UserID:    &user.ID,
		Action:    "register",
		IPAddress: ip,
		UserAgent: ua,
		Details:   fmt.Sprintf("User registered with email: %s and username: %s. Assigned role: %s", email, username, role),
		CreatedAt: time.Now(),
	})

	// 8. Simulate email dispatch
	fmt.Printf("\n========================================================")
	fmt.Printf("\n[EMAIL SIMULATOR] Welcome to DaemonBoard, %s!", username)
	fmt.Printf("\nClick the link below to verify your email address:")
	fmt.Printf("\nhttp://localhost:3000/verify-email?token=%s", verificationToken)
	fmt.Printf("\n========================================================\n\n")

	return user, accessToken, refreshTokenStr, nil
}

func (s *DefaultAuthService) Login(ctx context.Context, username, password, ip, ua string) (*models.User, string, string, error) {
	// 1. Fetch user
	user, err := s.repo.GetUserByUsername(username)
	if err != nil {
		return nil, "", "", err
	}

	// If username not found, check by email (fallback convenience)
	if user == nil {
		user, err = s.repo.GetUserByEmail(username)
		if err != nil {
			return nil, "", "", err
		}
	}

	if user == nil {
		// Log failed attempt without details (prevent enumeration)
		_ = s.repo.CreateAuditLog(&models.AuditLog{
			ID:        uuid.New(),
			Action:    "login_failed",
			IPAddress: ip,
			UserAgent: ua,
			Details:   fmt.Sprintf("Failed login attempt with username/email: %s (User not found)", username),
			CreatedAt: time.Now(),
		})
		return nil, "", "", errors.New("invalid username/email or password")
	}

	// 2. Compare password
	if err := utils.ComparePasswords(user.PasswordHash, password); err != nil {
		_ = s.repo.CreateAuditLog(&models.AuditLog{
			ID:        uuid.New(),
			UserID:    &user.ID,
			Action:    "login_failed",
			IPAddress: ip,
			UserAgent: ua,
			Details:   fmt.Sprintf("Failed login attempt for user: %s (Password mismatch)", user.Username),
			CreatedAt: time.Now(),
		})
		return nil, "", "", errors.New("invalid username/email or password")
	}

	// 3. Generate Access & Refresh Tokens
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.Email, user.Role, s.jwtSecret)
	if err != nil {
		return nil, "", "", err
	}

	refreshTokenStr, err := utils.GenerateRefreshToken()
	if err != nil {
		return nil, "", "", err
	}

	// 4. Save Refresh Token
	rt := &models.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		Token:     refreshTokenStr,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
	}
	if err := s.repo.SaveRefreshToken(rt); err != nil {
		return nil, "", "", err
	}

	// 5. Record successful login audit log
	_ = s.repo.CreateAuditLog(&models.AuditLog{
		ID:        uuid.New(),
		UserID:    &user.ID,
		Action:    "login_success",
		IPAddress: ip,
		UserAgent: ua,
		Details:   fmt.Sprintf("Successful login session initialized for user: %s", user.Username),
		CreatedAt: time.Now(),
	})

	return user, accessToken, refreshTokenStr, nil
}

func (s *DefaultAuthService) VerifyEmail(ctx context.Context, token, ip, ua string) error {
	user, err := s.repo.GetUserByVerificationToken(token)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("invalid or expired verification token")
	}

	user.IsVerified = true
	user.VerificationToken = ""
	user.UpdatedAt = time.Now()

	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	// Record audit log
	_ = s.repo.CreateAuditLog(&models.AuditLog{
		ID:        uuid.New(),
		UserID:    &user.ID,
		Action:    "email_verified",
		IPAddress: ip,
		UserAgent: ua,
		Details:   fmt.Sprintf("User: %s successfully verified email address.", user.Username),
		CreatedAt: time.Now(),
	})

	return nil
}

func (s *DefaultAuthService) RefreshToken(ctx context.Context, refreshTokenStr, ip, ua string) (string, string, error) {
	// 1. Fetch Refresh Token from DB
	rt, err := s.repo.GetRefreshToken(refreshTokenStr)
	if err != nil {
		return "", "", err
	}
	if rt == nil {
		return "", "", errors.New("refresh token not found or invalid")
	}

	// 2. Check Expiry
	if time.Now().After(rt.ExpiresAt) {
		_ = s.repo.DeleteRefreshToken(refreshTokenStr)
		return "", "", errors.New("refresh token has expired")
	}

	// 3. Fetch User
	user, err := s.repo.GetUserByID(rt.UserID)
	if err != nil {
		return "", "", err
	}
	if user == nil {
		return "", "", errors.New("user associated with token not found")
	}

	// 4. Generate New Access Token and rotated Refresh Token
	newAccessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.Email, user.Role, s.jwtSecret)
	if err != nil {
		return "", "", err
	}

	newRefreshTokenStr, err := utils.GenerateRefreshToken()
	if err != nil {
		return "", "", err
	}

	// Delete old token
	if err := s.repo.DeleteRefreshToken(refreshTokenStr); err != nil {
		return "", "", err
	}

	// Save new rotated token
	newRt := &models.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		Token:     newRefreshTokenStr,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
	}
	if err := s.repo.SaveRefreshToken(newRt); err != nil {
		return "", "", err
	}

	// Record audit log
	_ = s.repo.CreateAuditLog(&models.AuditLog{
		ID:        uuid.New(),
		UserID:    &user.ID,
		Action:    "token_refresh",
		IPAddress: ip,
		UserAgent: ua,
		Details:   fmt.Sprintf("Rotated refresh token context session for user: %s", user.Username),
		CreatedAt: time.Now(),
	})

	return newAccessToken, newRefreshTokenStr, nil
}

func (s *DefaultAuthService) ForgotPassword(ctx context.Context, email, ip, ua string) error {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return err
	}

	// Return success anyway to avoid user enumeration
	if user == nil {
		return nil
	}

	// Generate reset token and set 1-hour validity
	resetToken := uuid.New().String()
	expiry := time.Now().Add(1 * time.Hour)

	user.ResetToken = resetToken
	user.ResetTokenExpiry = &expiry
	user.UpdatedAt = time.Now()

	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	// Record audit log
	_ = s.repo.CreateAuditLog(&models.AuditLog{
		ID:        uuid.New(),
		UserID:    &user.ID,
		Action:    "password_reset_request",
		IPAddress: ip,
		UserAgent: ua,
		Details:   fmt.Sprintf("Password reset requested for user email: %s", email),
		CreatedAt: time.Now(),
	})

	// Simulate email dispatch
	fmt.Printf("\n========================================================")
	fmt.Printf("\n[EMAIL SIMULATOR] Password Reset Requested!")
	fmt.Printf("\nClick the link below to change your password:")
	fmt.Printf("\nhttp://localhost:3000/reset-password?token=%s", resetToken)
	fmt.Printf("\n========================================================\n\n")

	return nil
}

func (s *DefaultAuthService) ResetPassword(ctx context.Context, token, newPassword, ip, ua string) error {
	user, err := s.repo.GetUserByResetToken(token)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("invalid or expired password reset token")
	}

	// Check Expiry
	if user.ResetTokenExpiry == nil || time.Now().After(*user.ResetTokenExpiry) {
		return errors.New("reset token has expired")
	}

	// Hash password
	pwdHash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	user.PasswordHash = pwdHash
	user.ResetToken = ""
	user.ResetTokenExpiry = nil
	user.UpdatedAt = time.Now()

	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	// Invalidate all sessions on password change for security
	_ = s.repo.DeleteUserRefreshTokens(user.ID)

	// Record audit log
	_ = s.repo.CreateAuditLog(&models.AuditLog{
		ID:        uuid.New(),
		UserID:    &user.ID,
		Action:    "password_reset_success",
		IPAddress: ip,
		UserAgent: ua,
		Details:   fmt.Sprintf("User: %s successfully reset password.", user.Username),
		CreatedAt: time.Now(),
	})

	return nil
}

func (s *DefaultAuthService) GetCurrentUser(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	return s.repo.GetUserByID(userID)
}

func (s *DefaultAuthService) GetAuditLogs(ctx context.Context, requesterID uuid.UUID) ([]models.AuditLog, error) {
	// Ensure caller is admin
	user, err := s.repo.GetUserByID(requesterID)
	if err != nil {
		return nil, err
	}
	if user == nil || user.Role != "Administrator" {
		return nil, errors.New("permission denied: administrator role required")
	}

	return s.repo.GetAuditLogs()
}

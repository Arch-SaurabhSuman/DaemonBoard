package repository

import (
	"errors"

	"github.com/google/uuid"
	"github.com/saura/daemonboard/backend/internal/domain/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	CreateUser(user *models.User) error
	GetUserByID(id uuid.UUID) (*models.User, error)
	GetUserByUsername(username string) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	GetUserByVerificationToken(token string) (*models.User, error)
	GetUserByResetToken(token string) (*models.User, error)
	UpdateUser(user *models.User) error

	SaveRefreshToken(rt *models.RefreshToken) error
	GetRefreshToken(token string) (*models.RefreshToken, error)
	DeleteRefreshToken(token string) error
	DeleteUserRefreshTokens(userID uuid.UUID) error

	CreateAuditLog(log *models.AuditLog) error
	GetAuditLogs() ([]models.AuditLog, error)
}

type GORMUserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &GORMUserRepository{db: db}
}

func (r *GORMUserRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *GORMUserRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *GORMUserRepository) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, "username = ?", username).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *GORMUserRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *GORMUserRepository) GetUserByVerificationToken(token string) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, "verification_token = ?", token).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *GORMUserRepository) GetUserByResetToken(token string) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, "reset_token = ?", token).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *GORMUserRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *GORMUserRepository) SaveRefreshToken(rt *models.RefreshToken) error {
	return r.db.Create(rt).Error
}

func (r *GORMUserRepository) GetRefreshToken(token string) (*models.RefreshToken, error) {
	var rt models.RefreshToken
	if err := r.db.First(&rt, "token = ?", token).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &rt, nil
}

func (r *GORMUserRepository) DeleteRefreshToken(token string) error {
	return r.db.Delete(&models.RefreshToken{}, "token = ?", token).Error
}

func (r *GORMUserRepository) DeleteUserRefreshTokens(userID uuid.UUID) error {
	return r.db.Delete(&models.RefreshToken{}, "user_id = ?", userID).Error
}

func (r *GORMUserRepository) CreateAuditLog(log *models.AuditLog) error {
	return r.db.Create(log).Error
}

func (r *GORMUserRepository) GetAuditLogs() ([]models.AuditLog, error) {
	var logs []models.AuditLog
	if err := r.db.Order("created_at desc").Find(&logs).Error; err != nil {
		return nil, err
	}
	return logs, nil
}

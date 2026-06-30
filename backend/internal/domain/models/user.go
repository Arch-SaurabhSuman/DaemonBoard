package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Username          string     `gorm:"size:100;uniqueIndex;not null" json:"username"`
	Email             string     `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash      string     `gorm:"size:255;not null" json:"-"`
	Role              string     `gorm:"size:50;default:'Developer';not null" json:"role"`
	IsVerified        bool       `gorm:"default:false;not null" json:"isVerified"`
	VerificationToken string     `gorm:"size:255" json:"-"`
	ResetToken        string     `gorm:"size:255" json:"-"`
	ResetTokenExpiry  *time.Time `json:"-"`
	AvatarURL         string     `gorm:"size:500" json:"avatarUrl"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;index;not null" json:"userId"`
	Token     string    `gorm:"size:500;uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
}

type AuditLog struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    *uuid.UUID `gorm:"type:uuid;index" json:"userId,omitempty"`
	Action    string     `gorm:"size:100;not null" json:"action"`
	IPAddress string     `gorm:"size:45" json:"ipAddress"`
	UserAgent string     `gorm:"size:500" json:"userAgent"`
	Details   string     `gorm:"type:text" json:"details"`
	CreatedAt time.Time  `json:"createdAt"`
}

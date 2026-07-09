package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes the input password using bcrypt with a cost of 12.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// ComparePasswords compares a bcrypt hashed password with its possible plaintext equivalent.
func ComparePasswords(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

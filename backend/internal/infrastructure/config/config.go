package config

import (
	"log"

	"github.com/spf13/viper"
)

// Config holds all configuration variables for the application.
type Config struct {
	Env        string `mapstructure:"ENV"`
	Port       string `mapstructure:"PORT"`
	DBHost     string `mapstructure:"DB_HOST"`
	DBPort     string `mapstructure:"DB_PORT"`
	DBUser     string `mapstructure:"DB_USER"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`
	DBSSLMode  string `mapstructure:"DB_SSLMODE"`
	RedisHost  string `mapstructure:"REDIS_HOST"`
	RedisPort  string `mapstructure:"REDIS_PORT"`
	RedisPass  string `mapstructure:"REDIS_PASSWORD"`
	RedisDB    int    `mapstructure:"REDIS_DB"`
	JWTSecret  string `mapstructure:"JWT_SECRET"`
}

// LoadConfig reads configuration from file or environment variables.
func LoadConfig() (*Config, error) {
	viper.AddConfigPath(".")
	viper.SetConfigName(".env")
	viper.SetConfigType("env")

	viper.AutomaticEnv()

	// Set sane defaults
	viper.SetDefault("ENV", "development")
	viper.SetDefault("PORT", "5000")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "daemonboard")
	viper.SetDefault("DB_SSLMODE", "disable")
	viper.SetDefault("REDIS_HOST", "localhost")
	viper.SetDefault("REDIS_PORT", "6379")
	viper.SetDefault("REDIS_PASSWORD", "")
	viper.SetDefault("REDIS_DB", 0)
	viper.SetDefault("JWT_SECRET", "supersecretjwtkey")

	if err := viper.ReadInConfig(); err != nil {
		log.Println("Warning: No local .env file loaded, proceeding with default/system env parameters.")
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

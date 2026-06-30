package redis

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
	"github.com/saura/daemonboard/backend/internal/infrastructure/config"
)

// ConnectRedis sets up and tests connection status with Redis.
func ConnectRedis(cfg *config.Config) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPass,
		DB:       cfg.RedisDB,
	})

	// Verify connectivity using a quick ping-pong command
	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to ping Redis: %w", err)
	}

	return rdb, nil
}

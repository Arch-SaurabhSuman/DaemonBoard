package main

import (
	"fmt"
	"net/http"

	"github.com/saura/daemonboard/backend/internal/infrastructure/config"
	"github.com/saura/daemonboard/backend/internal/infrastructure/database"
	"github.com/saura/daemonboard/backend/internal/infrastructure/logger"
	"github.com/saura/daemonboard/backend/internal/infrastructure/redis"
	"github.com/saura/daemonboard/backend/internal/infrastructure/router"
)

func main() {
	// 1. Parse configuration parameters
	cfg, err := config.LoadConfig()
	if err != nil {
		panic(fmt.Sprintf("Failed to load environment configuration: %v", err))
	}

	// 2. Initialize log formats
	logger.InitLogger(cfg.Env)
	logger.Log.Infof("Starting DaemonBoard API service in [%s] profile...", cfg.Env)

	// 3. Connect to database engine
	logger.Log.Info("Initializing PostgreSQL database context...")
	db, err := database.ConnectDB(cfg)
	if err != nil {
		logger.Log.Warnf("PostgreSQL database connection failed: %v. Server running in disconnected mode.", err)
	} else {
		logger.Log.Info("Successfully established PostgreSQL session connection.")
		_ = db // Used later for dependency injection to repositories
	}

	// 4. Connect to key-value storage engine
	logger.Log.Info("Initializing Redis cache client...")
	rdb, err := redis.ConnectRedis(cfg)
	if err != nil {
		logger.Log.Warnf("Redis cache connection failed: %v. Cache functionality will be bypassed.", err)
	} else {
		logger.Log.Info("Successfully established Redis server connection.")
		_ = rdb // Used later for cache/sessions injection
	}

	// 5. Scaffolding API endpoints and middlewares
	serverRouter := router.SetupRouter(cfg)

	// 6. Starting HTTP listener
	addr := fmt.Sprintf(":%s", cfg.Port)
	logger.Log.Infof("DaemonBoard listening and serving HTTP on %s", addr)

	server := &http.Server{
		Addr:    addr,
		Handler: serverRouter,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Log.Fatalf("API Server crashed during run execution: %v", err)
	}
}

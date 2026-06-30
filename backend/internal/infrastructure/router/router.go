package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/saura/daemonboard/backend/internal/domain/repository"
	"github.com/saura/daemonboard/backend/internal/handlers"
	"github.com/saura/daemonboard/backend/internal/infrastructure/config"
	"github.com/saura/daemonboard/backend/internal/infrastructure/middleware"
	"github.com/saura/daemonboard/backend/internal/services"
	"gorm.io/gorm"
)

// SetupRouter constructs the gin server instance and hooks routing layers.
func SetupRouter(cfg *config.Config, db *gorm.DB) *gin.Engine {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Attach custom and default middleware handlers
	r.Use(middleware.LoggerMiddleware())
	r.Use(gin.Recovery()) // Built-in panic recoverer
	r.Use(middleware.CORSMiddleware())

	// Top level health checking path
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "UP",
			"environment": cfg.Env,
		})
	})

	// Dependency Injection setup for Auth
	var authHandler *handlers.AuthHandler
	if db != nil {
		userRepo := repository.NewUserRepository(db)
		authService := services.NewAuthService(userRepo, cfg.JWTSecret)
		authHandler = handlers.NewAuthHandler(authService)
	}

	// Scaffolding version 1 API group namespaces
	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "API_V1_OK",
			})
		})

		// Wire Auth Endpoints if db is available
		if authHandler != nil {
			authGroup := api.Group("/auth")
			{
				authGroup.POST("/register", authHandler.Register)
				authGroup.POST("/login", authHandler.Login)
				authGroup.POST("/refresh", authHandler.RefreshToken)
				authGroup.GET("/verify-email", authHandler.VerifyEmail)
				authGroup.POST("/forgot-password", authHandler.ForgotPassword)
				authGroup.POST("/reset-password", authHandler.ResetPassword)

				// Protected Auth Routes
				protected := authGroup.Group("")
				protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
				{
					protected.GET("/me", authHandler.GetMe)
				}
			}

			// Admin Protected Routes
			adminGroup := api.Group("/admin")
			adminGroup.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			adminGroup.Use(middleware.RBACMiddleware("Administrator"))
			{
				adminGroup.GET("/audit-logs", authHandler.GetAuditLogs)
			}
		}
	}

	return r
}

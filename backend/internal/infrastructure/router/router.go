package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/saura/daemonboard/backend/internal/infrastructure/config"
	"github.com/saura/daemonboard/backend/internal/infrastructure/middleware"
)

// SetupRouter constructs the gin server instance and hooks routing layers.
func SetupRouter(cfg *config.Config) *gin.Engine {
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

	// Scaffolding version 1 API group namespaces
	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "API_V1_OK",
			})
		})
	}

	return r
}

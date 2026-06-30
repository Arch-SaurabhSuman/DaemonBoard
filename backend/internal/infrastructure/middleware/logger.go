package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/saura/daemonboard/backend/internal/infrastructure/logger"
	"github.com/sirupsen/logrus"
)

// LoggerMiddleware redirects gin console prints to our centralized Winston-equivalent Logrus setup.
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		c.Next()
		latencyTime := time.Since(startTime)

		reqMethod := c.Request.Method
		reqUri := c.Request.RequestURI
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()

		entry := logger.Log.WithFields(logrus.Fields{
			"status_code":  statusCode,
			"latency_time": latencyTime.String(),
			"client_ip":    clientIP,
			"req_method":   reqMethod,
			"req_uri":      reqUri,
		})

		if statusCode >= 500 {
			entry.Error("HTTP Request Failed")
		} else if statusCode >= 400 {
			entry.Warn("HTTP Request Client Issue")
		} else {
			entry.Info("HTTP Request Complete")
		}
	}
}

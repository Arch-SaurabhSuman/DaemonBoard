package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

// Log is the global pre-configured logrus logger instance.
var Log = logrus.New()

// InitLogger configures the logger based on environment conditions.
func InitLogger(env string) {
	Log.Out = os.Stdout

	if env == "production" {
		Log.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: "2006-01-02 15:04:05",
		})
		Log.SetLevel(logrus.InfoLevel)
	} else {
		Log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05",
			ForceColors:     true,
		})
		Log.SetLevel(logrus.DebugLevel)
	}
}

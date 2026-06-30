# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Pre-copy modules to utilize Docker layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build statically
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary from the builder layer
COPY --from=builder /app/main .
# Default backup env file
COPY --from=builder /app/.env.example ./.env

EXPOSE 5000

CMD ["./main"]

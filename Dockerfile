FROM node:22-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM golang:1.24-alpine AS backend-builder
WORKDIR /backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/api ./cmd/api

FROM alpine:3.20
WORKDIR /app

COPY --from=backend-builder /out/api /app/api
COPY --from=frontend-builder /frontend/dist /app/static

ENV STATIC_DIR=/app/static
EXPOSE 10000

CMD ["/app/api"]

package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

const version = "1.0.0"

type config struct {
	port  int
	env   string
	mongo struct {
		uri                 string
		database            string
		collection          string
		dashboardCollection string
		limitsCollection    string
		poisCollection      string
	}
	geohash struct {
		token string
	}
	redis struct {
		addr     string
		password string
	}
}

type application struct {
	config                   config
	logger                   *log.Logger
	redisClient              *redis.Client
	mongoClient              *mongo.Client
	mongoDatabase            *mongo.Database
	mongoCollection          *mongo.Collection
	mongoDashboardCollection *mongo.Collection
	mongoLimitsCollection    *mongo.Collection
	mongoPoisCollection      *mongo.Collection
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 4000, "API server port")
	flag.StringVar(&cfg.env, "env", "development", "Enviroment (development|staging|production)")
	flag.Parse()

	_ = godotenv.Load()
	cfg.mongo.uri = getEnv("MONGODB_URI", "")
	cfg.mongo.database = getEnv("MONGODB_DB", "otodom_data")
	cfg.mongo.collection = getEnv("MONGODB_COLLECTION", "listings_clean")
	cfg.mongo.dashboardCollection = getEnv("MONGODB_DASHBOARD_COLLECTION", "dashboard_aggregates")
	cfg.mongo.limitsCollection = getEnv("MONGODB_OFFER_LIMITS_COLLECTION", "filter_limits_v2")
	cfg.mongo.poisCollection = getEnv("MONGODB_POIS_COLLECTION", "pois")
	cfg.geohash.token = getEnv("GEOHASH_TOKEN", "")
	if cfg.mongo.uri == "" {
		log.Fatal("missing MONGODB_URI")
	}
	cfg.redis.addr = getEnv("REDIS_ADDR", "localhost:6379")
	cfg.redis.password = getEnv("REDIS_PASSWORD", "")

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	mongoCtx, mongoCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer mongoCancel()

	client, err := mongo.Connect(options.Client().ApplyURI(cfg.mongo.uri))
	if err != nil {
		logger.Fatal(err)
	}
	defer func() {
		_ = client.Disconnect(context.Background())
	}()

	if err := client.Ping(mongoCtx, readpref.Primary()); err != nil {
		logger.Fatal(err)
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.redis.addr,
		Password: cfg.redis.password,
		DB:       0,
	})
	defer rdb.Close()

	redisCtx, redisCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer redisCancel()
	if err := rdb.Ping(redisCtx).Err(); err != nil {
		logger.Fatal("redis connection failed:", err)
	}

	database := client.Database(cfg.mongo.database)
	collection := database.Collection(cfg.mongo.collection)
	dashboardCollection := database.Collection(cfg.mongo.dashboardCollection)
	limitsCollection := database.Collection(cfg.mongo.limitsCollection)
	poisCollection := database.Collection(cfg.mongo.poisCollection)
	app := &application{
		config:                   cfg,
		logger:                   logger,
		redisClient:              rdb,
		mongoClient:              client,
		mongoDatabase:            database,
		mongoCollection:          collection,
		mongoDashboardCollection: dashboardCollection,
		mongoLimitsCollection:    limitsCollection,
		mongoPoisCollection:      poisCollection,
	}

	app.startSelfHealthcheckLoop()

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	logger.Printf("starting %s server on %s", cfg.env, srv.Addr)
	err = srv.ListenAndServe()
	logger.Fatal(err)
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

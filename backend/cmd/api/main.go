package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

const version = "1.0.0"

type config struct {
	port      int
	env       string
	staticDir string
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
	valuationURL string
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
	valuationClient          *http.Client
}

func main() {
	var cfg config

	defaultPort := 4000
	if portFromEnv := getEnv("PORT", ""); portFromEnv != "" {
		parsedPort, err := strconv.Atoi(portFromEnv)
		if err != nil {
			log.Fatalf("invalid PORT value %q: %v", portFromEnv, err)
		}
		defaultPort = parsedPort
	}

	flag.IntVar(&cfg.port, "port", defaultPort, "API server port")
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
	cfg.staticDir = getEnv("STATIC_DIR", "./static")
	cfg.valuationURL = getEnv("VALUATION_URL", "http://r-valuation:8000")

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
		valuationClient:          &http.Client{Timeout: 30 * time.Second},
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

package main

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/mmcloughlin/geohash"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type geohashUpdateResponse struct {
	Scanned int `json:"scanned"`
	Updated int `json:"updated"`
	Skipped int `json:"skipped"`
	Errors  int `json:"errors"`
}

type geohashCandidate struct {
	ID           bson.ObjectID               `bson:"_id"`
	Localization geohashCandidateLocalization `bson:"localization,omitempty"`
}

type geohashCandidateLocalization struct {
	Latitude  *float64 `bson:"latitude,omitempty"`
	Longitude *float64 `bson:"longitude,omitempty"`
}

func (app *application) requireGeohashToken(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if app.config.geohash.token == "" {
			http.Error(w, "missing GEOHASH_TOKEN", http.StatusInternalServerError)
			return
		}

		authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(authHeader, bearerPrefix) {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		token := strings.TrimSpace(strings.TrimPrefix(authHeader, bearerPrefix))
		if token != app.config.geohash.token {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
}

func (app *application) updateListingsGeohashHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Minute)
	defer cancel()

	limit, err := readOptionalLimit(r)
	if err != nil {
		http.Error(w, "invalid limit", http.StatusBadRequest)
		return
	}

	filter := bson.M{
		"localization.geohash": bson.M{"$exists": false},
	}

	projection := bson.M{
		"_id":                    1,
		"localization.latitude":  1,
		"localization.longitude": 1,
	}

	findOptions := options.Find().SetProjection(projection)
	if limit > 0 {
		findOptions.SetLimit(int64(limit))
	}

	cursor, err := app.mongoCollection.Find(ctx, filter, findOptions)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	response := geohashUpdateResponse{}

	for cursor.Next(ctx) {
		response.Scanned++

		var candidate geohashCandidate
		if err := cursor.Decode(&candidate); err != nil {
			app.logger.Printf("geohash decode failed: %v", err)
			response.Errors++
			continue
		}

		lat, lng, ok := getCandidateLatLng(candidate)
		if !ok {
			response.Skipped++
			continue
		}

		value := geohash.Encode(lat, lng)
		update := bson.M{"$set": bson.M{"localization.geohash": value}}
		result, err := app.mongoCollection.UpdateOne(ctx, bson.M{"_id": candidate.ID}, update)
		if err != nil {
			app.logger.Printf("geohash update failed for %s: %v", candidate.ID.Hex(), err)
			response.Errors++
			continue
		}
		if result.ModifiedCount > 0 {
			response.Updated++
		} else {
			response.Skipped++
		}
	}

	if err := cursor.Err(); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, response, nil); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}

func readOptionalLimit(r *http.Request) (int, error) {
	value := strings.TrimSpace(r.URL.Query().Get("limit"))
	if value == "" {
		return 0, nil
	}

	limit, err := strconv.Atoi(value)
	if err != nil || limit < 0 {
		return 0, strconv.ErrSyntax
	}

	return limit, nil
}

func getCandidateLatLng(candidate geohashCandidate) (float64, float64, bool) {
	if candidate.Localization.Latitude != nil && candidate.Localization.Longitude != nil {
		return *candidate.Localization.Latitude, *candidate.Localization.Longitude, true
	}

	return 0, 0, false
}

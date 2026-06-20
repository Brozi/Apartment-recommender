package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
	"github.com/redis/go-redis/v9"
)

func (app *application) getRecommendationInfoHandler(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	sessionHash := params.ByName("sessionHash")

	if sessionHash == "" {
		http.Error(w, "missing session hash", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	dataStr, err := app.redisClient.Get(ctx, sessionHash).Result()
	if err == redis.Nil {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}
	if err != nil {
		app.logger.Println("redis get:", err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	var sp sessionPayload
	if err := json.Unmarshal([]byte(dataStr), &sp); err != nil {
		app.logger.Println("unmarshal session payload:", err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	if !sp.Scored {
		http.Error(w, "session is not a recommendation session", http.StatusBadRequest)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, sp.Entries, nil); err != nil {
		app.logger.Println(err)
	}
}

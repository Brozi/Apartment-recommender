package main

import (
	"context"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type filterRange struct {
	Lower float64 `bson:"lower" json:"lower"`
	Upper float64 `bson:"upper" json:"upper"`
}

type filterLimits struct {
	Price         filterRange `bson:"price" json:"price"`
	PricePerMeter filterRange `bson:"price_per_meter" json:"pricePerMeter"`
	Area          filterRange `bson:"area" json:"area"`
	BuildYear     filterRange `bson:"build_year" json:"buildYear"`
}

type filterLimitsDocument struct {
	City   string       `bson:"city"`
	Limits filterLimits `bson:"limits"`
}

func (app *application) getFilterLimitsHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	// TODO: Przekazywać miasto jak będziemy mieli dane z innych miast
	city := "Kraków"

	filter := bson.M{"city": city}
	projection := bson.M{"_id": 0, "limits": 1}

	var doc filterLimitsDocument
	err := app.mongoLimitsCollection.FindOne(
		ctx,
		filter,
		options.FindOne().SetProjection(projection),
	).Decode(&doc)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	err = app.writeJSON(w, http.StatusOK, doc.Limits, nil)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}

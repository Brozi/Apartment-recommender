package main

import (
	"context"
	"net/http"
	"time"

	"aprtsapp.nicksanchez.pl/internal/data"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type mongoData []data.MapOfferMongo
type apiResponse data.MapOfferDTO

func (app *application) getMapDataHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	data, err := app.createMapOffer(ctx)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	response := make([]apiResponse, 0, len(data))
	for _, offer := range data {
		response = append(response, apiResponse{
			ID:    offer.ID.Hex(),
			Lat:   offer.Localization.Latitude,
			Lng:   offer.Localization.Longitude,
			Price: offer.Price,
		})
	}
	

	err = app.writeJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}

func (app *application) createMapOffer(ctx context.Context) (mongoData, error) {
	filter := bson.D{}
	projection := bson.M{
		"_id":                 1,
		"area":                 1,
		"link":                 1,
		"localization.city":    1,
		"localization.district": 1,
		"localization.street":  1,
		"localization.latitude": 1,
		"localization.longitude": 1,
		"price":                1,
		"price_per_meter":      1,
		"rooms":                1,
		"photo_urls":           1,
	}

	findOptions := options.Find().
		SetProjection(projection).
		SetLimit(100)

	cursor, err := app.mongoCollection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results mongoData
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}
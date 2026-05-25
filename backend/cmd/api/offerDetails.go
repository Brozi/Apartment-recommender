package main

import (
	"context"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func (app *application) getOfferByIDHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r) 
    if err != nil {
        http.NotFound(w, r)
        return
    }

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	data, err := app.createMapOfferDetails(ctx, id)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	response := apiMapOfferDetailsResponse{
		ID:         id,
		Lat:        data.Localization.Latitude,
		Lng:        data.Localization.Longitude,
		Price:      data.Price,
		City:       data.Localization.City,
		District:   data.Localization.District,
		Street:     data.Localization.Street,
		Rooms:      StringToInt(data.Rooms),
		Area:       data.Area,
		PricePerM2: data.PricePerMeter,
		PhotoUrls:  data.PhotoUrls,
		Link:       data.Link,
	}
	

	err = app.writeJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}

func (app *application) createMapOfferDetails(ctx context.Context, id string) (mongoMapOfferData, error) {
	objectID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return mongoMapOfferData{}, err
	}

	filter := bson.D{{Key: "_id", Value: objectID}}
	projection := bson.M{
		"area":                  1,
		"link":                  1,
		"localization.city":     1,
		"localization.district": 1,
		"localization.street":   1,
		"localization.latitude": 1,
		"localization.longitude": 1,
		"price":                 1,
		"price_per_meter":       1,
		"rooms":                 1,
		"photo_urls":            1,
	}

	var result mongoMapOfferData
	err = app.mongoCollection.FindOne(
		ctx,
		filter,
		options.FindOne().SetProjection(projection),
	).Decode(&result)
	if err != nil {
		return mongoMapOfferData{}, err
	}

	return result, nil
}
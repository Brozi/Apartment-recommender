package main

import (
	"context"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type poiCategoryGroup string

const (
	ParcelService     poiCategoryGroup = "parcel_service"
	GroceryRetail     poiCategoryGroup = "grocery_retail"
	BusStop           poiCategoryGroup = "bus_stop"
	TramStop          poiCategoryGroup = "tram_stop"
	Kindergarten      poiCategoryGroup = "kindergarten"
	School            poiCategoryGroup = "school"
	SpecializedSchool poiCategoryGroup = "specialized_school"
	University        poiCategoryGroup = "university"
	DrivingSchool     poiCategoryGroup = "driving_school"
)

type mapPoi struct {
	ID            int64            `json:"id"`
	CategoryGroup poiCategoryGroup `json:"categoryGroup"`
	Lat           float64          `json:"lat"`
	Lng           float64          `json:"lng"`
	Name          string           `json:"name"`
}

type mapPoisResponse struct {
	Pois []mapPoi `json:"pois"`
}

type mongoPoi struct {
	OsmID         int64            `bson:"osm_id"`
	CategoryGroup poiCategoryGroup `bson:"category_group"`
	Location      struct {
		Coordinates []float64 `bson:"coordinates"` // [lng, lat]
	} `bson:"location"`
	Tags struct {
		Name string `bson:"name"`
	} `bson:"tags"`
}

func (app *application) getPoisHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	viewport, err := readViewportQuery(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	filter := bson.M{
		"location": bson.M{
			"$geoWithin": bson.M{
				"$geometry": bson.M{
					"type": "Polygon",
					"coordinates": []interface{}{
						[]interface{}{
							[]float64{viewport.West, viewport.South},
							[]float64{viewport.East, viewport.South},
							[]float64{viewport.East, viewport.North},
							[]float64{viewport.West, viewport.North},
							[]float64{viewport.West, viewport.South},
						},
					},
				},
			},
		},
	}

	findOptions := options.Find().
        SetProjection(bson.M{
            "osm_id": 1,
            "category_group": 1,
            "location.coordinates": 1,
            "tags.name": 1,
        }).
        SetLimit(500)

	cursor, err := app.mongoPoisCollection.Find(ctx, filter, findOptions)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var rawPois []mongoPoi
	if err := cursor.All(ctx, &rawPois); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	pois := make([]mapPoi, 0, len(rawPois))
	for _, p := range rawPois {
		pois = append(pois, mapPoi{
			ID:            p.OsmID,
			CategoryGroup: p.CategoryGroup,
			Lat:           p.Location.Coordinates[1],
			Lng:           p.Location.Coordinates[0],
			Name:          p.Tags.Name,
		})
	}

	err = app.writeJSON(w, http.StatusOK, mapPoisResponse{Pois: pois}, nil)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}
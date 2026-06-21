package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func (app *application) getMapDataHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	viewport, err := readViewportQuery(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sessionHash := r.URL.Query().Get("sessionHash")
	geohashPrefix := geohashPrefixLength(viewport.Zoom)

	data, entryMap, total, err := app.createMapOffers(ctx, viewport, geohashPrefix, sessionHash)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	response := buildMapResponse(data, entryMap, total)

	err = app.writeJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}

type offersByPointResponse struct {
	OfferIDs []string `json:"offerIDs"`
}

func (app *application) getOffersByPointHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	lat, lng, err := readPointQuery(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	const epsilon = 0.0001
	filter := bson.M{
		"is_active": true,
		"localization.latitude": bson.M{
			"$gte": lat - epsilon,
			"$lte": lat + epsilon,
		},
		"localization.longitude": bson.M{
			"$gte": lng - epsilon,
			"$lte": lng + epsilon,
		},
	}

	projection := bson.M{"_id": 1}
	findOptions := options.Find().SetProjection(projection)

	cursor, err := app.mongoCollection.Find(ctx, filter, findOptions)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var results []struct {
		ID bson.ObjectID `bson:"_id"`
	}
	if err := cursor.All(ctx, &results); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	ids := make([]string, 0, len(results))
	for _, result := range results {
		ids = append(ids, result.ID.Hex())
	}

	if err := app.writeJSON(w, http.StatusOK, offersByPointResponse{OfferIDs: ids}, nil); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}


type mapViewportQuery struct {
	North float64
	South float64
	East  float64
	West  float64
	Zoom  int
}

type mapClusterItem struct {
	Type  string  `json:"type"`
	Lat   float64 `json:"lat"`
	Lng   float64 `json:"lng"`
	Count int64   `json:"count"`
}

type mapOfferItem struct {
	Type       string  `json:"type"`
	ID         string  `json:"id"`
	TotalPrice float64 `json:"totalPrice"`
	Lat        float64 `json:"lat"`
	Lng        float64 `json:"lng"`
	Score      float64 `json:"score,omitempty"`
	Rank       int     `json:"rank,omitempty"`
}

type mapResponseItems[T any] struct {
	Items []T `json:"items"`
}

type mapResponse struct {
	Offers        mapResponseItems[mapOfferItem]         `json:"offers"`
	OffersInPoint mapResponseItems[mapOffersInPointItem] `json:"offersInPoint"`
	Clusters      mapResponseItems[mapClusterItem]       `json:"clusters"`
	ResultsCount  int                                    `json:"resultsCount,omitempty"`
}

type mapOfferInPointEntry struct {
	ID    string  `json:"id"`
	Score float64 `json:"score,omitempty"`
	Rank  int     `json:"rank,omitempty"`
}

type mapOffersInPointItem struct {
	Type         string               `json:"type"`
	Lat          float64              `json:"lat"`
	Lng          float64              `json:"lng"`
	Count        int64                `json:"count"`
	FirstOfferID string               `json:"firstOfferID"`
	Offers       []mapOfferInPointEntry `json:"offers,omitempty"`
}

type mapAggregationResult struct {
	Count    int64           `bson:"count"`
	AvgLat   float64         `bson:"avgLat"`
	AvgLng   float64         `bson:"avgLng"`
	FirstID  bson.ObjectID   `bson:"firstId"`
	FirstLat float64         `bson:"firstLat"`
	FirstLng float64         `bson:"firstLng"`
	Price    float64         `bson:"firstPrice"`
	MinLat   float64         `bson:"minLat"`
	MaxLat   float64         `bson:"maxLat"`
	MinLng   float64         `bson:"minLng"`
	MaxLng   float64         `bson:"maxLng"`
	AllIDs   []bson.ObjectID `bson:"allIds"`
}

func (app *application) createMapOffers(ctx context.Context, viewport mapViewportQuery, geohashPrefix int, sessionHash string) ([]mapAggregationResult, map[string]sessionEntry, int, error) {
	match := bson.M{
		"is_active": true,
		"localization.latitude": bson.M{
			"$gte": viewport.South,
			"$lte": viewport.North,
		},
		"localization.longitude": bson.M{
			"$gte": viewport.West,
			"$lte": viewport.East,
		},
		"geohash": bson.M{"$type": "string"},
	}

	var entryMap map[string]sessionEntry
	isScored := false
	total := 0

	if sessionHash != "" {
		idsJSON, err := app.redisClient.Get(ctx, sessionHash).Result()
		if err != nil && err != redis.Nil {
			return nil, nil, 0, fmt.Errorf("redis get session: %w", err)
		}
		if err == nil {
			var payload sessionPayload
			if jsonErr := json.Unmarshal([]byte(idsJSON), &payload); jsonErr != nil {
				return nil, nil, 0, fmt.Errorf("unmarshal session payload: %w", jsonErr)
			}
			validObjectIDs := make([]bson.ObjectID, 0)
			if payload.Scored {
				isScored = true
				total = payload.Total
				entryMap = make(map[string]sessionEntry, len(payload.Entries))
				for _, e := range payload.Entries {
					oid, parseErr := bson.ObjectIDFromHex(e.ID)
					if parseErr == nil {
						validObjectIDs = append(validObjectIDs, oid)
						entryMap[e.ID] = e
					}
				}
			} else {
				for _, id := range payload.IDs {
					oid, parseErr := bson.ObjectIDFromHex(id)
					if parseErr == nil {
						validObjectIDs = append(validObjectIDs, oid)
					}
				}
			}
			if len(validObjectIDs) > 0 {
				match["_id"] = bson.M{"$in": validObjectIDs}
			}
		}
	}

	groupID := bson.M{
		"$substrCP": bson.A{"$geohash", 0, geohashPrefix},
	}

	groupStage := bson.M{
		"_id":        groupID,
		"count":      bson.M{"$sum": 1},
		"avgLat":     bson.M{"$avg": "$localization.latitude"},
		"avgLng":     bson.M{"$avg": "$localization.longitude"},
		"firstId":    bson.M{"$first": "$_id"},
		"firstLat":   bson.M{"$first": "$localization.latitude"},
		"firstLng":   bson.M{"$first": "$localization.longitude"},
		"firstPrice": bson.M{"$first": "$price"},
		"minLat":     bson.M{"$min": "$localization.latitude"},
		"maxLat":     bson.M{"$max": "$localization.latitude"},
		"minLng":     bson.M{"$min": "$localization.longitude"},
		"maxLng":     bson.M{"$max": "$localization.longitude"},
	}
	projectStage := bson.M{
		"_id":        0,
		"count":      1,
		"avgLat":     1,
		"avgLng":     1,
		"firstId":    1,
		"firstLat":   1,
		"firstLng":   1,
		"firstPrice": 1,
		"minLat":     1,
		"maxLat":     1,
		"minLng":     1,
		"maxLng":     1,
	}
	if isScored {
		groupStage["allIds"] = bson.M{"$push": "$_id"}
		projectStage["allIds"] = 1
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: match}},
		bson.D{{Key: "$group", Value: groupStage}},
		bson.D{{Key: "$project", Value: projectStage}},
	}

	cursor, err := app.mongoCollection.Aggregate(ctx, pipeline, options.Aggregate())
	if err != nil {
		return nil, nil, 0, err
	}
	defer cursor.Close(ctx)

	var results []mapAggregationResult
	if err := cursor.All(ctx, &results); err != nil {
		return nil, nil, 0, err
	}

	return results, entryMap, total, nil
}

func buildMapResponse(data []mapAggregationResult, entryMap map[string]sessionEntry, total int) mapResponse {
	response := mapResponse{
		Offers:        mapResponseItems[mapOfferItem]{Items: []mapOfferItem{}},
		OffersInPoint: mapResponseItems[mapOffersInPointItem]{Items: []mapOffersInPointItem{}},
		Clusters:      mapResponseItems[mapClusterItem]{Items: []mapClusterItem{}},
		ResultsCount:  total,
	}

	for _, item := range data {
		if item.Count > 1 && item.MinLat == item.MaxLat && item.MinLng == item.MaxLng {
			oip := mapOffersInPointItem{
				Type:         "offersInPoint",
				Lat:          item.MinLat,
				Lng:          item.MinLng,
				Count:        item.Count,
				FirstOfferID: item.FirstID.Hex(),
			}
			if entryMap != nil && len(item.AllIDs) > 0 {
				offers := make([]mapOfferInPointEntry, 0, len(item.AllIDs))
				for _, oid := range item.AllIDs {
					id := oid.Hex()
					if e, ok := entryMap[id]; ok {
						offers = append(offers, mapOfferInPointEntry{ID: id, Score: e.Score, Rank: e.Rank})
					} else {
						offers = append(offers, mapOfferInPointEntry{ID: id})
					}
				}
				sort.Slice(offers, func(i, j int) bool {
					if offers[i].Rank == 0 {
						return false
					}
					if offers[j].Rank == 0 {
						return true
					}
					return offers[i].Rank < offers[j].Rank
				})
				oip.Offers = offers
			}
			response.OffersInPoint.Items = append(response.OffersInPoint.Items, oip)
			continue
		}

		if item.Count <= 1 {
			offerID := item.FirstID.Hex()
			offerItem := mapOfferItem{
				Type:       "offer",
				ID:         offerID,
				TotalPrice: item.Price,
				Lat:        item.FirstLat,
				Lng:        item.FirstLng,
			}
			if entryMap != nil {
				if e, ok := entryMap[offerID]; ok {
					offerItem.Score = e.Score
					offerItem.Rank = e.Rank
				}
			}
			response.Offers.Items = append(response.Offers.Items, offerItem)
			continue
		}

		response.Clusters.Items = append(response.Clusters.Items, mapClusterItem{
			Type:  "cluster",
			Lat:   item.AvgLat,
			Lng:   item.AvgLng,
			Count: item.Count,
		})
	}

	return response
}

func readViewportQuery(r *http.Request) (mapViewportQuery, error) {
	values := r.URL.Query()
	zoom, err := parseIntQuery(values.Get("zoom"), "zoom")
	if err != nil {
		return mapViewportQuery{}, err
	}

	north, err := parseFloatQuery(values.Get("north"), "north")
	if err != nil {
		return mapViewportQuery{}, err
	}

	south, err := parseFloatQuery(values.Get("south"), "south")
	if err != nil {
		return mapViewportQuery{}, err
	}

	east, err := parseFloatQuery(values.Get("east"), "east")
	if err != nil {
		return mapViewportQuery{}, err
	}

	west, err := parseFloatQuery(values.Get("west"), "west")
	if err != nil {
		return mapViewportQuery{}, err
	}

	if north <= south {
		return mapViewportQuery{}, fmt.Errorf("north must be greater than south")
	}

	return mapViewportQuery{
		North: north,
		South: south,
		East:  east,
		West:  west,
		Zoom:  zoom,
	}, nil
}

func parseFloatQuery(raw string, name string) (float64, error) {
	if raw == "" {
		return 0, fmt.Errorf("missing %s", name)
	}

	value, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid %s", name)
	}

	return value, nil
}

func readPointQuery(r *http.Request) (float64, float64, error) {
	values := r.URL.Query()
	lat, err := parseFloatQuery(values.Get("lat"), "lat")
	if err != nil {
		return 0, 0, err
	}

	lng, err := parseFloatQuery(values.Get("lng"), "lng")
	if err != nil {
		return 0, 0, err
	}

	return lat, lng, nil
}

func parseIntQuery(raw string, name string) (int, error) {
	if raw == "" {
		return 0, fmt.Errorf("missing %s", name)
	}

	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("invalid %s", name)
	}

	return value, nil
}

func geohashPrefixLength(zoom int) int {
	switch {
	case zoom == 18:
		return 11
	case zoom == 17:
		return 9
	case zoom == 16:
		return 7
	case zoom == 15:
		return 6
	case zoom == 14:
		return 6
	case zoom == 13:
		return 5
	case zoom == 12:
		return 4
	case zoom >= 10:
		return 3
	default:
		return 2
	}
}

type coordinates struct {
	Lat float64
	Lng float64
}

func Centoid(coords []coordinates) (float64, float64) {
	var totalLat, totalLng float64
	numCoords := float64(len(coords))

	for _, c := range coords {
		totalLat += c.Lat
		totalLng += c.Lng
	}

	return totalLat / numCoords, totalLng / numCoords
}

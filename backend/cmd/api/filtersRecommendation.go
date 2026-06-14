package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var districtMapping = map[string]string{
	"stare_miasto":           "Stare Miasto",
	"grzegorzki":             "Grzegórzki",
	"pradnik_czerwony":       "Prądnik Czerwony",
	"pradnik_bialy":          "Prądnik Biały",
	"krowodrza":              "Krowodrza",
	"zwierzyniec":            "Zwierzyniec",
	"bronowice":              "Bronowice",
	"lobzow":                 "Łobzów",
	"debniki":                "Dębniki",
	"podgorze":               "Podgórze",
	"biezanow_prokocim":      "Bieżanów-Prokocim",
	"swoszowice":             "Swoszowice",
	"wzgorza_krzeslawickie":  "Wzgórza Krzesławickie",
	"nowa_huta":              "Nowa Huta",
	"czyzyny":                "Czyżyny",
	"mistrzejowice":          "Mistrzejowice",
	"bienczyce":              "Bieńczyce",
	"lagiewniki_borek_falecki": "Łagiewniki-Borek Fałęcki",
	"podgorze_duchackie":     "Podgórze Duchackie",
}

var marketTypeMapping = map[string]string{
	"primary":   "Primary",
	"secondary": "Secondary",
}

var conditionMapping = map[string]string{
	"ready_to_use":  "Ready to Use",
	"to_renovation": "To Renovation",
	"to_completion": "To Completion",
}

var buildingTypeMapping = map[string][]string{
	"apartment": {"Block", "Tenement", "Apartment", "Infill"},
	"house":     {"Semi Detached", "Ribbon", "House", "Detached"},
}

var poiRangeToCountField = map[string]string{
	"500_m":  "count_500m",
	"1000_m": "count_1000m",
	"1500_m": "count_1500m",
}

type pois struct {
	Poi   string `json:"poi"`
	Range string `json:"range"`
}

type step1Filters struct {
	BuildingType string   `json:"buildingType"`
	Districts    []string `json:"districts"`
	TotalPrice   struct {
		TotalPriceFrom string `json:"totalPriceFrom"`
		TotalPriceTo   string `json:"totalPriceTo"`
	} `json:"totalPrice"`
	PricePerM2 struct {
		PricePerM2From string `json:"pricePerM2From"`
		PricePerM2To   string `json:"pricePerM2To"`
	} `json:"pricePerM2"`
	Area struct {
		AreaFrom string `json:"areaFrom"`
		AreaTo   string `json:"areaTo"`
	} `json:"area"`
	BuildYear struct {
		BuildYearFrom string `json:"buildYearFrom"`
		BuildYearTo   string `json:"buildYearTo"`
	} `json:"buildYear"`
	Rooms      []string `json:"rooms"`
	MarketType string   `json:"marketType"`
	Condition  string   `json:"condition"`
	Pois       []pois   `json:"pois"`
}

// TODO: Dodać pola z ważnością wybranych filtrów
type step2Filters struct {
	SkipRecommendation bool `json:"skipRecommendation"`
}

type filtersPayload struct {
	Step1 step1Filters `json:"step1"`
	Step2 step2Filters `json:"step2"`
}

type filterSessionResponse struct {
	SessionHash string `json:"sessionHash"`
}

func (app *application) createFiltersAndRecommendationHandler(w http.ResponseWriter, r *http.Request) {
	reqCtx, reqCancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer reqCancel()

	var rawBody map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&rawBody); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	canonical, err := json.Marshal(rawBody)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	hash := sha256.Sum256(canonical)
	sessionKey := fmt.Sprintf("session:%x", hash)

	exists, err := app.redisClient.Exists(reqCtx, sessionKey).Result()
	if err != nil && err != redis.Nil {
		app.logger.Println("redis exists:", err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}
	if exists > 0 {
		if err := app.writeJSON(w, http.StatusOK, filterSessionResponse{SessionHash: sessionKey}, nil); err != nil {
			app.logger.Println(err)
		}
		return
	}

	var payload filtersPayload
	if err := json.Unmarshal(canonical, &payload); err != nil {
		http.Error(w, "invalid filter structure", http.StatusBadRequest)
		return
	}

	fetchCtx, fetchCancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer fetchCancel()

	var matchingIDs []string

	if payload.Step2.SkipRecommendation {
		matchingIDs, err = app.fetchMatchingIDsStrict(fetchCtx, payload.Step1)
	} else {
		// TODO: Implementacja rekomendacji
		matchingIDs, err = app.fetchMatchingIDsStrict(fetchCtx, payload.Step1)
	}

	if err != nil {
		app.logger.Println("fetchMatchingIDsStrict:", err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	idsJSON, err := json.Marshal(matchingIDs)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}
	if err := app.redisClient.Set(fetchCtx, sessionKey, idsJSON, time.Hour).Err(); err != nil {
		app.logger.Println("redis set:", err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, filterSessionResponse{SessionHash: sessionKey}, nil); err != nil {
		app.logger.Println(err)
	}
}

func (app *application) fetchMatchingIDsStrict(ctx context.Context, step1 step1Filters) ([]string, error) {
	filter := bson.M{}

	if step1.BuildingType != "" && step1.BuildingType != "any" {
		if mapped, ok := buildingTypeMapping[strings.ToLower(step1.BuildingType)]; ok {
			filter["building.type"] = bson.M{"$in": mapped}
		}
	}

	if len(step1.Districts) > 0 && !containsSentinel(step1.Districts, "all") {
		mapped := make([]string, 0, len(step1.Districts))
		for _, slug := range step1.Districts {
			if canonical, ok := districtMapping[strings.ToLower(slug)]; ok {
				mapped = append(mapped, canonical)
			}
		}
		if len(mapped) > 0 {
			filter["localization.district"] = bson.M{"$in": mapped}
		}
	}

	if priceF := buildRangeFilter(step1.TotalPrice.TotalPriceFrom, step1.TotalPrice.TotalPriceTo); priceF != nil {
		filter["price"] = priceF
	}

	if ppmF := buildRangeFilter(step1.PricePerM2.PricePerM2From, step1.PricePerM2.PricePerM2To); ppmF != nil {
		filter["price_per_meter"] = ppmF
	}

	if areaF := buildRangeFilter(step1.Area.AreaFrom, step1.Area.AreaTo); areaF != nil {
		filter["area"] = areaF
	}

	if byF := buildRangeFilter(step1.BuildYear.BuildYearFrom, step1.BuildYear.BuildYearTo); byF != nil {
		filter["building.build_year"] = byF
	}

	if len(step1.Rooms) > 0 && !containsSentinel(step1.Rooms, "any") {
		var explicit []string
		hasFivePlus := false
		for _, r := range step1.Rooms {
			if r == "5+" {
				hasFivePlus = true
			} else {
				explicit = append(explicit, r)
			}
		}

		fivePlusExpr := bson.M{"$expr": bson.M{"$gte": bson.A{bson.M{"$toInt": "$rooms"}, 5}}}

		switch {
		case hasFivePlus && len(explicit) > 0:
			filter["$or"] = bson.A{
				bson.M{"rooms": bson.M{"$in": explicit}},
				fivePlusExpr,
			}
		case hasFivePlus:
			filter["$expr"] = fivePlusExpr["$expr"]
		default:
			filter["rooms"] = bson.M{"$in": explicit}
		}
	}

	if step1.MarketType != "" && step1.MarketType != "any" {
		if mapped, ok := marketTypeMapping[strings.ToLower(step1.MarketType)]; ok {
			filter["market_type"] = mapped
		}
	}

	if step1.Condition != "" && step1.Condition != "any" {
		if mapped, ok := conditionMapping[strings.ToLower(step1.Condition)]; ok {
			filter["construction_status"] = mapped
		}
	}

	// for _, p := range step1.Pois {
	// 	countField, ok := poiRangeToCountField[p.Range]
	// 	if !ok {
	// 		continue
	// 	}
	// 	mongoField := fmt.Sprintf("geo_aggregations.%s.%s", p.Poi, countField)
	// 	filter[mongoField] = bson.M{"$gt": 0}
	// }

	projection := bson.M{"_id": 1}
	cursor, err := app.mongoCollection.Find(ctx, filter, options.Find().SetProjection(projection))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		ID bson.ObjectID `bson:"_id"`
	}
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	ids := make([]string, 0, len(results))
	for _, r := range results {
		ids = append(ids, r.ID.Hex())
	}
	return ids, nil
}

func buildRangeFilter(from, to string) bson.M {
	f := bson.M{}
	if from != "" {
		if v, err := strconv.ParseFloat(from, 64); err == nil {
			f["$gte"] = v
		}
	}
	if to != "" {
		if v, err := strconv.ParseFloat(to, 64); err == nil {
			f["$lte"] = v
		}
	}
	if len(f) == 0 {
		return nil
	}
	return f
}

func containsSentinel(values []string, sentinel string) bool {
	for _, v := range values {
		if v == sentinel {
			return true
		}
	}
	return false
}

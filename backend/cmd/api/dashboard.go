package main

import (
	"context"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type buildYearEntry struct {
	Range string `json:"range"`
	Count int    `json:"count"`
}

type roomsEntry struct {
	Rooms string `json:"rooms"`
	Count int    `json:"count"`
}

type finishingStateEntry struct {
	State string `json:"state"`
	Count int    `json:"count"`
}

type timelineEntry struct {
	Year   int    `json:"year"`
	Date   string `json:"date"`
	Offers int    `json:"offers"`
}

type infoBoxEntry struct {
	ID              int     `json:"id"`
	Title           string  `json:"title"`
	FirstLineTitle  string  `json:"firstLineTitle"`
	FirstLineValue  float64 `json:"firstLineValue"`
	SecondLineTitle string  `json:"secondLineTitle"`
	SecondLineValue float64 `json:"secondLineValue"`
	Unit            string  `json:"unit"`
}

type dashboardKpisResponse struct {
	InfoBoxes          []infoBoxEntry        `json:"info_boxes"`
	BuildYear          []buildYearEntry      `json:"build_year"`
	Rooms              []roomsEntry          `json:"rooms"`
	FinishingState     []finishingStateEntry `json:"finishing_state"`
	ExpensiveDistricts []interface{}         `json:"expensive_districts"`
	CheapestDistricts  []interface{}         `json:"cheapest_districts"`
	NewOffersTimeline  []timelineEntry       `json:"new_offers_timeline"`
}

func (app *application) getDashboardKpisHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	city := "krakow"

	buildYear, err := app.aggregateBuildYear(ctx, city)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	rooms, err := app.aggregateRooms(ctx, city)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	finishingState, err := app.aggregateFinishingState(ctx, city)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	newOffersTimeline, err := app.aggregateNewOffersTimeline(ctx, city)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	kpiStats, err := app.aggregateKpiStats(ctx, city)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	marketTypeCounts, err := app.aggregateMarketTypeCounts(ctx, city)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	infoBoxes := []infoBoxEntry{
		{
			ID:              1,
			Title:           "Price per m2",
			FirstLineTitle:  "Average",
			FirstLineValue:  kpiStats.AvgPricePerMeter,
			SecondLineTitle: "Median",
			SecondLineValue: kpiStats.MedPricePerMeter,
			Unit:            "zł",
		},
		{
			ID:              2,
			Title:           "Total price",
			FirstLineTitle:  "Average",
			FirstLineValue:  kpiStats.AvgPrice,
			SecondLineTitle: "Median",
			SecondLineValue: kpiStats.MedPrice,
			Unit:            "zł",
		},
		{
			ID:              3,
			Title:           "Area",
			FirstLineTitle:  "Average",
			FirstLineValue:  kpiStats.AvgArea,
			SecondLineTitle: "Median",
			SecondLineValue: kpiStats.MedArea,
			Unit:            "m²",
		},
		{
			ID:              4,
			Title:           "Market type",
			FirstLineTitle:  "Primary",
			FirstLineValue:  float64(marketTypeCounts["primary"]),
			SecondLineTitle: "Secondary",
			SecondLineValue: float64(marketTypeCounts["secondary"]),
			Unit:            "",
		},
	}

	response := dashboardKpisResponse{
		InfoBoxes:          infoBoxes,
		BuildYear:          buildYear,
		Rooms:              rooms,
		FinishingState:     finishingState,
		ExpensiveDistricts: []interface{}{},
		CheapestDistricts:  []interface{}{},
		NewOffersTimeline:  newOffersTimeline,
	}

	err = app.writeJSON(w, http.StatusOK, response, nil)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}

type rangeCountResult struct {
	ID    string `bson:"_id"`
	Count int    `bson:"count"`
}

func (app *application) aggregateBuildYear(ctx context.Context, city string) ([]buildYearEntry, error) {
	ranges := []struct {
		label string
		min   int
		max   int
	}{
		{label: "1900 - 1960", min: 1900, max: 1960},
		{label: "1961 - 1990", min: 1961, max: 1990},
		{label: "1991 - 2000", min: 1991, max: 2000},
		{label: "2001 - 2010", min: 2001, max: 2010},
		{label: "2011 - 2026", min: 2011, max: 2026},
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{"localization.city": city}}},
		bson.D{{Key: "$project", Value: bson.M{
			"range": bson.M{
				"$switch": bson.M{
					"branches": bson.A{
						bson.M{"case": bson.M{"$and": bson.A{
							bson.M{"$gte": bson.A{"$building.build_year", ranges[0].min}},
							bson.M{"$lte": bson.A{"$building.build_year", ranges[0].max}},
						}}, "then": ranges[0].label},
						bson.M{"case": bson.M{"$and": bson.A{
							bson.M{"$gte": bson.A{"$building.build_year", ranges[1].min}},
							bson.M{"$lte": bson.A{"$building.build_year", ranges[1].max}},
						}}, "then": ranges[1].label},
						bson.M{"case": bson.M{"$and": bson.A{
							bson.M{"$gte": bson.A{"$building.build_year", ranges[2].min}},
							bson.M{"$lte": bson.A{"$building.build_year", ranges[2].max}},
						}}, "then": ranges[2].label},
						bson.M{"case": bson.M{"$and": bson.A{
							bson.M{"$gte": bson.A{"$building.build_year", ranges[3].min}},
							bson.M{"$lte": bson.A{"$building.build_year", ranges[3].max}},
						}}, "then": ranges[3].label},
						bson.M{"case": bson.M{"$and": bson.A{
							bson.M{"$gte": bson.A{"$building.build_year", ranges[4].min}},
							bson.M{"$lte": bson.A{"$building.build_year", ranges[4].max}},
						}}, "then": ranges[4].label},
					},
					"default": "unknown",
				},
			},
		}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$range",
			"count": bson.M{"$sum": 1},
		}}},
	}

	results, err := aggregateCounts(ctx, app.mongoCollection, pipeline)
	if err != nil {
		return nil, err
	}

	counts := map[string]int{}
	for _, result := range results {
		counts[result.ID] = result.Count
	}

	entries := make([]buildYearEntry, 0, len(ranges))
	for _, item := range ranges {
		entries = append(entries, buildYearEntry{Range: item.label, Count: counts[item.label]})
	}

	return entries, nil
}

func (app *application) aggregateRooms(ctx context.Context, city string) ([]roomsEntry, error) {
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{"localization.city": city}}},
		bson.D{{Key: "$project", Value: bson.M{
			"roomsValue": bson.M{
				"$cond": bson.A{
					bson.M{"$eq": bson.A{"$rooms", "5+"}},
					5,
					bson.M{"$convert": bson.M{
						"input":   "$rooms",
						"to":      "int",
						"onError": 0,
						"onNull":  0,
					}},
				},
			},
		}}},
		bson.D{{Key: "$project", Value: bson.M{
			"rooms": bson.M{
				"$switch": bson.M{
					"branches": bson.A{
						bson.M{"case": bson.M{"$eq": bson.A{"$roomsValue", 1}}, "then": "1"},
						bson.M{"case": bson.M{"$eq": bson.A{"$roomsValue", 2}}, "then": "2"},
						bson.M{"case": bson.M{"$eq": bson.A{"$roomsValue", 3}}, "then": "3"},
						bson.M{"case": bson.M{"$eq": bson.A{"$roomsValue", 4}}, "then": "4"},
						bson.M{"case": bson.M{"$gte": bson.A{"$roomsValue", 5}}, "then": "5+"},
					},
					"default": "unknown",
				},
			},
		}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$rooms",
			"count": bson.M{"$sum": 1},
		}}},
	}

	results, err := aggregateCounts(ctx, app.mongoCollection, pipeline)
	if err != nil {
		return nil, err
	}

	counts := map[string]int{}
	for _, result := range results {
		counts[result.ID] = result.Count
	}

	order := []string{"1", "2", "3", "4", "5+"}
	entries := make([]roomsEntry, 0, len(order))
	for _, label := range order {
		entries = append(entries, roomsEntry{Rooms: label, Count: counts[label]})
	}

	return entries, nil
}

func (app *application) aggregateFinishingState(ctx context.Context, city string) ([]finishingStateEntry, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "localization.city", Value: city}}}},
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$construction_status"}, {Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}}}}},
	}

	results, err := aggregateCounts(ctx, app.mongoCollection, pipeline)
	if err != nil {
		return nil, err
	}

	counts := map[string]int{}
	for _, result := range results {
		counts[result.ID] = result.Count
	}

	order := []string{"to_renovate", "to_completion", "ready_to_use"}
	entries := make([]finishingStateEntry, 0, len(order))
	for _, label := range order {
		entries = append(entries, finishingStateEntry{State: label, Count: counts[label]})
	}

	return entries, nil
}

func (app *application) aggregateNewOffersTimeline(ctx context.Context, city string) ([]timelineEntry, error) {
	startDate := time.Date(2026, time.April, 5, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2026, time.May, 6, 0, 0, 0, 0, time.UTC)

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"localization.city": city,
			"created_at": bson.M{
				"$gte": startDate,
				"$lt":  endDate,
			},
		}}},
		{{Key: "$project", Value: bson.D{{Key: "createdDay", Value: bson.D{{Key: "$dateTrunc", Value: bson.D{{Key: "date", Value: "$created_at"}, {Key: "unit", Value: "day"}}}}}}}},
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$createdDay"}, {Key: "offers", Value: bson.D{{Key: "$sum", Value: 1}}}}}},
		{{Key: "$project", Value: bson.D{
			{Key: "year", Value: bson.D{{Key: "$year", Value: "$_id"}}},
			{Key: "date", Value: bson.D{{Key: "$dateToString", Value: bson.D{{Key: "format", Value: "%d.%m"}, {Key: "date", Value: "$_id"}}}}},
			{Key: "offers", Value: 1},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
	}

	cursor, err := app.mongoCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	type timelineResult struct {
		Year   int    `bson:"year"`
		Date   string `bson:"date"`
		Offers int    `bson:"offers"`
	}

	var entries []timelineEntry
	for cursor.Next(ctx) {
		var result timelineResult
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		entries = append(entries, timelineEntry{Year: result.Year, Date: result.Date, Offers: result.Offers})
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return entries, nil
}

type kpiStats struct {
	AvgPricePerMeter float64
	MedPricePerMeter float64
	AvgPrice         float64
	MedPrice         float64
	AvgArea          float64
	MedArea          float64
}

func (app *application) aggregateKpiStats(ctx context.Context, city string) (kpiStats, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "localization.city", Value: city}}}},
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "avgPricePerMeter", Value: bson.D{{Key: "$avg", Value: "$price_per_meter"}}},
			{Key: "medPricePerMeter", Value: bson.D{{Key: "$percentile", Value: bson.D{{Key: "input", Value: "$price_per_meter"}, {Key: "p", Value: bson.A{0.5}}, {Key: "method", Value: "approximate"}}}}},
			{Key: "avgPrice", Value: bson.D{{Key: "$avg", Value: "$price"}}},
			{Key: "medPrice", Value: bson.D{{Key: "$percentile", Value: bson.D{{Key: "input", Value: "$price"}, {Key: "p", Value: bson.A{0.5}}, {Key: "method", Value: "approximate"}}}}},
			{Key: "avgArea", Value: bson.D{{Key: "$avg", Value: "$area"}}},
			{Key: "medArea", Value: bson.D{{Key: "$percentile", Value: bson.D{{Key: "input", Value: "$area"}, {Key: "p", Value: bson.A{0.5}}, {Key: "method", Value: "approximate"}}}}},
		}}},
	}

	cursor, err := app.mongoCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return kpiStats{}, err
	}
	defer cursor.Close(ctx)

	type statsResult struct {
		AvgPricePerMeter float64   `bson:"avgPricePerMeter"`
		MedPricePerMeter []float64 `bson:"medPricePerMeter"`
		AvgPrice         float64   `bson:"avgPrice"`
		MedPrice         []float64 `bson:"medPrice"`
		AvgArea          float64   `bson:"avgArea"`
		MedArea          []float64 `bson:"medArea"`
	}

	if cursor.Next(ctx) {
		var result statsResult
		if err := cursor.Decode(&result); err != nil {
			return kpiStats{}, err
		}

		return kpiStats{
			AvgPricePerMeter: result.AvgPricePerMeter,
			MedPricePerMeter: firstOrZero(result.MedPricePerMeter),
			AvgPrice:         result.AvgPrice,
			MedPrice:         firstOrZero(result.MedPrice),
			AvgArea:          result.AvgArea,
			MedArea:          firstOrZero(result.MedArea),
		}, nil
	}

	if err := cursor.Err(); err != nil {
		return kpiStats{}, err
	}

	return kpiStats{}, nil
}

func (app *application) aggregateMarketTypeCounts(ctx context.Context, city string) (map[string]int, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "localization.city", Value: city}}}},
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$market_type"}, {Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}}}}},
	}

	results, err := aggregateCounts(ctx, app.mongoCollection, pipeline)
	if err != nil {
		return nil, err
	}

	counts := map[string]int{"primary": 0, "secondary": 0}
	for _, result := range results {
		counts[result.ID] = result.Count
	}

	return counts, nil
}

func aggregateCounts(ctx context.Context, collection *mongo.Collection, pipeline mongo.Pipeline) ([]rangeCountResult, error) {
	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []rangeCountResult
	for cursor.Next(ctx) {
		var result rangeCountResult
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		if result.ID == "unknown" || result.ID == "" {
			continue
		}
		results = append(results, result)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return results, nil
}

func firstOrZero(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	return values[0]
}

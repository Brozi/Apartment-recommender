package main

import (
	"context"
	"net/http"
	"sort"
	"strconv"
	"strings"
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
		bson.D{{Key: "$match", Value: bson.M{
			"metric": "offer_count_by_rooms",
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "computed_at", Value: -1}}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$group_key.rooms",
			"count": bson.M{"$first": "$values.count"},
		}}},
	}

	results, err := aggregateCounts(ctx, app.mongoDashboardCollection, pipeline)
	if err != nil {
		return nil, err
	}

	counts := map[string]int{}
	for _, result := range results {
		counts[result.ID] = result.Count
	}

	entries := make([]roomsEntry, 0, len(counts))
	for label, count := range counts {
		entries = append(entries, roomsEntry{Rooms: label, Count: count})
	}

	sort.SliceStable(entries, func(i, j int) bool {
		left := roomsSortValue(entries[i].Rooms)
		right := roomsSortValue(entries[j].Rooms)
		if left == right {
			return entries[i].Rooms < entries[j].Rooms
		}
		return left < right
	})

	return entries, nil
}

func (app *application) aggregateFinishingState(ctx context.Context, city string) ([]finishingStateEntry, error) {
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{
			"metric": "offer_count_by_construction_status",
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "computed_at", Value: -1}}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$group_key.construction_status",
			"count": bson.M{"$first": "$values.count"},
		}}},
	}

	cursor, err := app.mongoDashboardCollection.Aggregate(ctx, pipeline)
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
		results = append(results, result)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	entries := make([]finishingStateEntry, 0, len(results))
	for _, result := range results {
		entries = append(entries, finishingStateEntry{State: result.ID, Count: result.Count})
	}

	sort.SliceStable(entries, func(i, j int) bool {
		leftUnknown := strings.EqualFold(entries[i].State, "unknown")
		rightUnknown := strings.EqualFold(entries[j].State, "unknown")
		if leftUnknown != rightUnknown {
			return !leftUnknown
		}
		return strings.ToLower(entries[i].State) < strings.ToLower(entries[j].State)
	})

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
	_ = city

	period := "2026-05"
	auctionType := "Sale"

	pricePerMeterPipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{
			"metric":           "monthly_price_per_meter_stats",
			"group_key.period": period,
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "computed_at", Value: -1}}}},
		bson.D{{Key: "$limit", Value: 1}},
		bson.D{{Key: "$project", Value: bson.M{
			"avgPricePerMeter": "$values.avg_price_per_meter",
			"medPricePerMeter": "$values.med_price_per_meter",
		}}},
	}

	pricePipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{
			"metric":                "monthly_price_stats",
			"group_key.period":      period,
			"group_key.auction_type": auctionType,
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "computed_at", Value: -1}}}},
		bson.D{{Key: "$limit", Value: 1}},
		bson.D{{Key: "$project", Value: bson.M{
			"avgPrice": "$values.avg_price",
			"medPrice": "$values.med_price",
		}}},
	}

	areaPipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{
			"metric":           "monthly_area_stats",
			"group_key.period": period,
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "computed_at", Value: -1}}}},
		bson.D{{Key: "$limit", Value: 1}},
		bson.D{{Key: "$project", Value: bson.M{
			"avgArea": "$values.avg_area",
			"medArea": "$values.med_area",
		}}},
	}

	var pricePerMeterResult struct {
		AvgPricePerMeter float64 `bson:"avgPricePerMeter"`
		MedPricePerMeter float64 `bson:"medPricePerMeter"`
	}
	pricePerMeterCursor, err := app.mongoDashboardCollection.Aggregate(ctx, pricePerMeterPipeline)
	if err != nil {
		return kpiStats{}, err
	}
	defer pricePerMeterCursor.Close(ctx)
	if pricePerMeterCursor.Next(ctx) {
		if err := pricePerMeterCursor.Decode(&pricePerMeterResult); err != nil {
			return kpiStats{}, err
		}
	}
	if err := pricePerMeterCursor.Err(); err != nil {
		return kpiStats{}, err
	}

	var priceResult struct {
		AvgPrice float64 `bson:"avgPrice"`
		MedPrice float64 `bson:"medPrice"`
	}
	priceCursor, err := app.mongoDashboardCollection.Aggregate(ctx, pricePipeline)
	if err != nil {
		return kpiStats{}, err
	}
	defer priceCursor.Close(ctx)
	if priceCursor.Next(ctx) {
		if err := priceCursor.Decode(&priceResult); err != nil {
			return kpiStats{}, err
		}
	}
	if err := priceCursor.Err(); err != nil {
		return kpiStats{}, err
	}

	var areaResult struct {
		AvgArea float64 `bson:"avgArea"`
		MedArea float64 `bson:"medArea"`
	}
	areaCursor, err := app.mongoDashboardCollection.Aggregate(ctx, areaPipeline)
	if err != nil {
		return kpiStats{}, err
	}
	defer areaCursor.Close(ctx)
	if areaCursor.Next(ctx) {
		if err := areaCursor.Decode(&areaResult); err != nil {
			return kpiStats{}, err
		}
	}
	if err := areaCursor.Err(); err != nil {
		return kpiStats{}, err
	}

	return kpiStats{
		AvgPricePerMeter: pricePerMeterResult.AvgPricePerMeter,
		MedPricePerMeter: pricePerMeterResult.MedPricePerMeter,
		AvgPrice:         priceResult.AvgPrice,
		MedPrice:         priceResult.MedPrice,
		AvgArea:          areaResult.AvgArea,
		MedArea:          areaResult.MedArea,
	}, nil
}

func (app *application) aggregateMarketTypeCounts(ctx context.Context, city string) (map[string]int, error) {
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.M{
			"metric": "offer_count_by_market_type",
		}}},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "computed_at", Value: -1}}}},
		bson.D{{Key: "$group", Value: bson.M{
			"_id":   "$group_key.market_type",
			"count": bson.M{"$first": "$values.count"},
		}}},
	}

	results, err := aggregateCounts(ctx, app.mongoDashboardCollection, pipeline)
	if err != nil {
		return nil, err
	}

	counts := map[string]int{"primary": 0, "secondary": 0}
	for _, result := range results {
		counts[strings.ToLower(result.ID)] = result.Count
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

func roomsSortValue(value string) int {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return 1_000_000
	}

	if strings.HasSuffix(trimmed, "+") {
		trimmed = strings.TrimSuffix(trimmed, "+")
	}

	parsed, err := strconv.Atoi(trimmed)
	if err != nil {
		return 1_000_000
	}

	return parsed
}

package data

import "go.mongodb.org/mongo-driver/v2/bson"

type MapOfferMongo struct {
	ID                 bson.ObjectID            `bson:"_id"`
	Area               float64                   `bson:"area"`
	Building           MapOfferMongoBuilding     `bson:"building"`
	ConstructionStatus string                    `bson:"construction_status"`
	Extras             []string                  `bson:"extras"`
	Floor              string                    `bson:"floor"`
	Heating            string                    `bson:"heating"`
	Link               string                    `bson:"link"`
	Localization       MapOfferMongoLocalization `bson:"localization"`
	MarketType         string                    `bson:"market_type"`
	OfferedBy          string                    `bson:"offered_by"`
	PhotoUrls          []string                  `bson:"photo_urls"`
	Price              float64                   `bson:"price"`
	PricePerMeter      float64                   `bson:"price_per_meter"`
	Rooms              string                    `bson:"rooms"`
}

type MapOfferMongoBuilding struct {
	Floors    int `bson:"floors"`
	BuildYear int `bson:"build_year"`
}

type MapOfferMongoLocalization struct {
	City      string  `bson:"city"`
	District  string  `bson:"district"`
	Street    string  `bson:"street"`
	Latitude  float64 `bson:"latitude"`
	Longitude float64 `bson:"longitude"`
}

type MapOfferDTO struct {
	ID    string  `json:"id"`
	Lat   float64 `json:"lat"`
	Lng   float64 `json:"lng"`
	Price float64 `json:"price"`
}

type MapOfferDetailsDTO struct {
	ID         string   `json:"id"`
	Lat        float64  `json:"lat"`
	Lng        float64  `json:"lng"`
	Price      float64  `json:"price"`
	City       string   `json:"city"`
	District   string   `json:"district"`
	Street     string   `json:"street"`
	Rooms      int      `json:"rooms"`
	Area       float64  `json:"area"`
	PricePerM2 float64  `json:"pricePerM2"`
	PhotoUrls  []string `json:"photoUrls"`
	Link       string   `json:"link"`
}

package data

import (
	"time"
)

type Offer struct {
	ID				ID		`json:"_id" bson:"_id"`
	OtodomID		int		`json:"otodom_id"`
	Area			float64	`json:"area"`
	Link 			string 	`json:"link"`
	AuctionType    	string  `json:"auction_type"`
	Building           Building 	`json:"building"`
	ConstructionStatus string   	`json:"construction_status"`
	CreatedAt		Date	`json:"created_at"`
	Description    	string  `json:"description"`
	DeveloperID        int      	`json:"developer_id"`
	EtlProcessed bool	`json:"etl_processed"`
	Promoted		bool	`json:"promoted"`
	Title			string	`json:"title"`
	Floor			string	`json:"floor"` //docelowo zamienić na inta
	Price			float64 `json:"price"`
	PricePerMeter	float64 `json:"price_per_meter"`
	Rooms          	string  `json:"rooms"` //docelowo zamienić na inta
	Heating        	string  `json:"heating"`
	Extras         	string  `json:"extras"`
	SecurityTypes  	string  `json:"security_types"`
	PhotoUrls      	string  `json:"photo_urls"`
	PropertyType   	string  `json:"property_type"`
	MarketType     	string  `json:"market_type"`
	Localization   	Localization	`json:"localization"`
	OfferedBy          string   	`json:"offered_by"`
}

type ID struct {
	Oid string `json:"$oid" bson:"$oid"`
}

type Date struct {
	Date time.Time `json:"$date" bson:"$date"`
}

type Localization struct {
	Province  string   `json:"province"`
	City      string   `json:"city"`
	Street    string   `json:"street"`
	County    string   `json:"county"`
	Latitude  float64  `json:"latitude"`
	Longitude float64  `json:"longitude"`
	Location  GeoPoint `json:"location"`
}

type GeoPoint struct {
	Type        string    `json:"type"`
	Coordinates []float64 `json:"coordinates"`
}

type Building struct {
	Floors    int    `json:"floors" bson:"floors"`
	BuildYear int    `json:"buildYear" bson:"build_year"`
	Type      string `json:"type" bson:"type"`
}
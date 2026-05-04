package data

import (
	"time"
)

type Offer struct {
	ID				ID		`json:"_id" bson:"_id"`
	Link 			string 	`json:"link"`
	Promoted		bool	`json:"promoted"`
	OtodomID		int		`json:"otodom_id"`
	CreatedAt		Date	`json:"created_at"`
	Title			string	`json:"title"`
	Area			float64	`json:"area"`
	Floor			string	`json:"floor"` //docelowo zamienić na inta
	Price			float64 `json:"price"`
	PricePerMeter	float64 `json:"price_per_meter"`
	Rooms          	string  `json:"rooms"` //docelowo zamienić na inta
	Heating        	string  `json:"heating"`
	Extras         	string  `json:"extras"`
	SecurityTypes  	string  `json:"security_types"`
	Description    	string  `json:"description"`
	PhotoUrls      	string  `json:"photo_urls"`
	PropertyType   	string  `json:"property_type"`
	MarketType     	string  `json:"market_type"`
	AuctionType    	string  `json:"auction_type"`
	Localization   	Localization	`json:"localization"`
	ConstructionStatus string   	`json:"construction_status"`
	Building           Building 	`json:"building"`
	OfferedBy          string   	`json:"offered_by"`
	DeveloperID        int      	`json:"developer_id"`
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
	Type      string `json:"type"`
	Floors    int    `json:"floors"`
	BuildYear int    `json:"build_year"`
}
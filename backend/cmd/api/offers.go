package main

import (
	"net/http"
	"time"

	"aprtsapp.nicksanchez.pl/internal/data"
)

func (app *application) getOfferByIDHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r) 
    if err != nil {
        http.NotFound(w, r)
        return
    }

	offer := data.Offer{
		ID: data.ID{
			Oid: id,
		},
		Link:      "https://www.otodom.pl/pl/oferta/2-pokojowe-mieszkanie-34m2-ogrodek-bez-prowizji-ID4zKdo",
		Promoted:  false,
		OtodomID:  67624478,
		CreatedAt: data.Date{
			Date: time.Date(2026, 4, 24, 22, 48, 45, 913000000, time.UTC),
		},
		Title:          "2-pokojowe mieszkanie 34m2 + ogródek Bez Prowizji",
		Area:           34.95,
		Floor:          "1",
		Price:          639585,
		PricePerMeter:  18300,
		Rooms:          "2",
		Heating:        "urban",
		Extras:         "garage, garden, lift, usable_room, balcony, terrace",
		SecurityTypes:  "entryphone, monitoring",
		Description:    "Brak opisu (oferta deweloperska).",
		PhotoUrls:      "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImIzbGttMm15dmpiMzMtRUNPU1lTVEVNIiwidyI6W3siZm4iOiJlbnZmcXFlMWF5NGsxLUFQTCIsInMiOiIxNCIsInAiOiIxMCwtMTAiLCJhIjoiMCJ9XX0.ypmIVvg11fgVgvC97sUw_yvWgpJJU3JTVr3yECenDlU/image;s=314x236;q=80, ...",
		PropertyType:   "flat",
		MarketType:     "primary",
		AuctionType:    "sale",
		Localization: data.Localization{
			Province:  "malopolskie",
			City:      "krakow",
			Street:    "Schillinga",
			County:    "Krakow",
			Latitude:  50.102918915123,
			Longitude: 19.955353460854,
			Location: data.GeoPoint{
				Type:        "Point",
				Coordinates: []float64{19.955353460854, 50.102918915123},
			},
		},
		ConstructionStatus: "to_completion",
		Building: data.Building{
			Type:      "block",
			Floors:    5,
			BuildYear: 2027,
		},
		OfferedBy:   "developer_unit",
		DeveloperID: 10540683,
	}

	err = app.writeJSON(w, http.StatusOK, offer, nil)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}
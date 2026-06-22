package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type flatValuationInput struct {
	District         string  `json:"district"`
	Rooms            string  `json:"rooms"`
	Area             float64 `json:"area"`
	BuildYear        float64 `json:"buildYear"`
	Condition        string  `json:"condition"`
	HasParking       bool    `json:"hasParking"`
	Floor            float64 `json:"floor"`
	FloorsInBuilding float64 `json:"floorsInBuilding"`
	HasElevator      bool    `json:"hasElevator"`
	HasBalcony       bool    `json:"hasBalcony"`
	MarketType       string  `json:"market_type"`
	OfferedBy        string  `json:"offered_by"`
	Heating          string  `json:"heating"`
	Lat              float64 `json:"lat"`
	Lon              float64 `json:"lon"`
}

type valuationResponse struct {
	EstimatedPrice float64 `json:"estimatedPrice"`
}

func (app *application) flatValuationHandler(w http.ResponseWriter, r *http.Request) {
	var req flatValuationInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	payload, err := json.Marshal(req)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	resp, err := app.valuationClient.Post(
		app.config.valuationURL+"/predict",
		"application/json",
		bytes.NewReader(payload),
	)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var result valuationResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, result, nil); err != nil {
		app.logger.Println(err)
		http.Error(w, "The server encountered a problem and could not process your request", http.StatusInternalServerError)
	}
}



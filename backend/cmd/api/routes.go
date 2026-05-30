package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/v1/healthcheck", app.healthcheckHandler)
	router.HandlerFunc(http.MethodGet, "/v1/dashboard/kpis", app.getDashboardKpisHandler)
	router.HandlerFunc(http.MethodGet, "/v1/map", app.getMapDataHandler)
	router.HandlerFunc(http.MethodGet, "/v1/offer/:id", app.getOfferByIDHandler)
	router.HandlerFunc(http.MethodPost, "/v1/listings/geohash", app.requireGeohashToken(app.updateListingsGeohashHandler))

	return app.enableCORS(router)
}

func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

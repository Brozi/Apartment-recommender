package main

import (
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/v1/healthcheck", app.healthcheckHandler)
	router.HandlerFunc(http.MethodGet, "/v1/dashboard/kpis", app.getDashboardKpisHandler)
	router.HandlerFunc(http.MethodGet, "/v1/map", app.getMapDataHandler)
	router.HandlerFunc(http.MethodGet, "/v1/offers/by-point", app.getOffersByPointHandler)
	router.HandlerFunc(http.MethodGet, "/v1/offer/:id", app.getOfferByIDHandler)
	router.HandlerFunc(http.MethodGet, "/v1/filter-limits/:city", app.getFilterLimitsHandler)
	router.HandlerFunc(http.MethodGet, "/v1/pois", app.getPoisHandler)
	router.HandlerFunc(http.MethodPost, "/v1/filters-and-recommendation", app.createFiltersAndRecommendationHandler)
	router.HandlerFunc(http.MethodPost, "/v1/listings/geohash", app.requireGeohashToken(app.updateListingsGeohashHandler))
	router.NotFound = app.frontendHandler()

	return app.enableCORS(router)
}

func (app *application) frontendHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.NotFound(w, r)
			return
		}

		cleanPath := path.Clean("/" + r.URL.Path)
		if cleanPath == "/v1" || strings.HasPrefix(cleanPath, "/v1/") {
			http.NotFound(w, r)
			return
		}

		if cleanPath != "/" {
			assetPath := filepath.Join(app.config.staticDir, strings.TrimPrefix(cleanPath, "/"))
			if info, err := os.Stat(assetPath); err == nil && !info.IsDir() {
				http.ServeFile(w, r, assetPath)
				return
			}
		}

		indexPath := filepath.Join(app.config.staticDir, "index.html")
		if info, err := os.Stat(indexPath); err == nil && !info.IsDir() {
			http.ServeFile(w, r, indexPath)
			return
		}

		http.NotFound(w, r)
	})
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

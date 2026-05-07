package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() *httprouter.Router {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/v1/healthcheck", app.healthcheckHandler)
	router.HandlerFunc(http.MethodGet, "/v1/test", app.testHandler)
	router.HandlerFunc(http.MethodGet, "/v1/offer/:id", app.getOfferByIDHandler)
	router.HandlerFunc(http.MethodGet, "/v1/dashboard/kpis", app.getDashboardKpisHandler)

	return router
}

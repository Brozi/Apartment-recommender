package main

import (
	"fmt"
	"net/http"
)

func (app *application) testHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "test")
}
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

func (app *application) startSelfHealthcheckLoop() {
	const interval = 5 * time.Minute

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for range ticker.C {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			req, err := http.NewRequestWithContext(
				ctx,
				http.MethodGet,
				fmt.Sprintf("http://127.0.0.1:%d/v1/healthcheck", app.config.port),
				nil,
			)
			if err != nil {
				cancel()
				app.logger.Println("self healthcheck request build failed:", err)
				continue
			}

			resp, err := http.DefaultClient.Do(req)
			cancel()
			if err != nil {
				app.logger.Println("self healthcheck request failed:", err)
				continue
			}
			_ = resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				app.logger.Printf("self healthcheck returned non-OK status: %d", resp.StatusCode)
			}
		}
	}()
}

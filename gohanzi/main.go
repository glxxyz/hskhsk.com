package main

import (
	"github.com/glxxyz/hskhsk.com/gohanzi/pages"
	"github.com/glxxyz/hskhsk.com/gohanzi/repo"
	"log"
	"net/http"
	"os"
)

func main() {
	log.Print("Server started")
	http.HandleFunc("/", pages.Handler(pages.IndexHandler))
	http.HandleFunc("/homophones", pages.Handler(pages.HomophonesHandler))
	http.HandleFunc("/radicals", pages.Handler(pages.RadicalsHandler))

	// Serve static files out of the public directory.
	// By configuring a static handler in app.yaml, App Engine serves all the
	// static content itself. As a result, the following two lines are in
	// effect for development only.
	static := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static", static))

	// Redirect some URLs from root to static server
	http.Handle("/favicon.ico", static)
	http.Handle("/favicon.png", static)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}

	go repo.EnsureResourcesLoaded()

	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}




package main

import (
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config"
	"client/app/index"
)

type AppTemplateVars struct {
	ClientPath string
}

func main() {
	configVars := config.GetConfigVars()

	server := mux.NewRouter()

	serveClient("/", server, configVars)

	index.InitIndexRequestHandler(server, configVars)
	log.Fatal(http.ListenAndServe(":"+configVars.Port, server))
}

/* Serves the front-end and requisite static files */
func serveClient(clientUrl string, server *mux.Router, configVars *config.Configuration) {
	server.HandleFunc(clientUrl, func(rw http.ResponseWriter, req *http.Request) {
		appTemplate := template.Must(template.ParseFiles(configVars.ClientPath + "/app.html"))
		err := appTemplate.ExecuteTemplate(rw, "app", AppTemplateVars{ClientPath: configVars.ClientPath})
		if err != nil {
			log.Panicln(err)
		}
	}).Methods("GET")

	staticBaseUrl := clientUrl + "static/"

	staticFileServer := http.StripPrefix(staticBaseUrl, http.FileServer(http.Dir("client")))
	server.PathPrefix(staticBaseUrl).Handler(staticFileServer)
}

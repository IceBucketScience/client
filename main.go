package main

import (
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config_vars"
	"client/app/facebook"
	"client/app/index"
	"shared/config"
	"shared/graph"
)

func main() {
	var configuration configVars.Configuration
	config.GetConfigVars(&configuration)

	facebook.InitFbClient(configuration.FbAppId, configuration.FbAppSecret)
	graph.InitGraph(configuration.DbUrl)

	server := mux.NewRouter()

	InitClientServer("/", server, &configuration)

	index.InitIndexRequestHandler(server, &configuration)

	log.Fatal(http.ListenAndServe(":"+configuration.Port, server))
}

/* Serves the front-end and requisite static files */
func InitClientServer(clientUrl string, server *mux.Router, config *configVars.Configuration) {
	server.HandleFunc(clientUrl, func(rw http.ResponseWriter, req *http.Request) {
		appTemplate := template.Must(template.ParseFiles(config.ClientPath + "/app.html"))
		err := appTemplate.ExecuteTemplate(rw, "app", struct {
			ClientPath string
		}{ClientPath: config.ClientPath})
		if err != nil {
			log.Panicln(err)
		}
	}).Methods("GET")

	staticBaseUrl := clientUrl + "static/"

	staticFileServer := http.StripPrefix(staticBaseUrl, http.FileServer(http.Dir("client")))
	server.PathPrefix(staticBaseUrl).Handler(staticFileServer)
}

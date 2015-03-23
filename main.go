package main

import (
	"html/template"
	"log"
	"net/http"

	"github.com/kelseyhightower/envconfig"
)

type Configuration struct {
	ClientPath string `envconfig:"CLIENT_PATH"`

	FbAppId     string `envconfig:"FB_APP_ID"`
	FbAppSecret string `envconfig:"FB_APP_SECRET"`
}

type AppTemplateVars struct {
	ClientPath string
}

func main() {
	config := getConfigVars()

	http.HandleFunc("/", serveApp(config))

	staticFileServer := http.StripPrefix("/static/", http.FileServer(http.Dir("client")))
	http.Handle("/static/", staticFileServer)

	log.Fatalln(http.ListenAndServe(":8080", nil))
}

func getConfigVars() Configuration {
	var config Configuration
	err := envconfig.Process("", &config)
	if err != nil {
		log.Panicln(err)
	}

	//TODO: checks for missing env variables

	return config
}

func serveApp(config Configuration) func(http.ResponseWriter, *http.Request) {
	return func(rw http.ResponseWriter, req *http.Request) {
		appTemplate := template.Must(template.ParseFiles(config.ClientPath + "/app.html"))
		err := appTemplate.ExecuteTemplate(rw, "app", AppTemplateVars{ClientPath: config.ClientPath})
		if err != nil {
			log.Panicln(err)
		}
	}
}

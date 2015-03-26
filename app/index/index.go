package index

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config"
	"client/app/msg_queue"
)

var indexingJobQueue *msgQueue.Queue

func InitIndexRequestHandler(server *mux.Router, configVars *config.Configuration) {
	indexingJobQueue = msgQueue.CreateQueue("indexing_job_queue", configVars.BaseUrl, server)

	indexingJobQueue.RegisterCallback("TEST", func(payload map[string]interface{}) {
		log.Println(payload)
	})

	server.HandleFunc("/index", handleIndexRequests(configVars)).
		Methods("POST")
}

type IndexRequestBody struct {
	UserId      string `json:"userId"`
	AccessToken string `json:"accessToken"`
}

func handleIndexRequests(configVars *config.Configuration) func(http.ResponseWriter, *http.Request) {
	return func(rw http.ResponseWriter, req *http.Request) {
		var indexRequest IndexRequestBody
		err := json.NewDecoder(req.Body).Decode(&indexRequest)
		if err != nil {
			log.Panicln(err)
		}

		indexingJobQueue.PushMessage("TEST", indexRequest)
	}
}

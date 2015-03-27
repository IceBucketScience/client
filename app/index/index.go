package index

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config"
	"shared/msg_queue"
)

var indexingJobQueue *msgQueue.DispatcherQueue
var indexingJobCompletionQueue *msgQueue.RecieverQueue

func InitIndexRequestHandler(server *mux.Router, configVars *config.Configuration) {
	indexingJobQueue = msgQueue.CreateDispatcherQueue("indexing_job_queue")

	server.HandleFunc("/index", handleIndexRequests(configVars)).
		Methods("POST")

	indexingJobCompletionQueue = msgQueue.CreateRecieverQueue("indexing_job_completion_queue", configVars.BaseUrl, server)

	indexingJobCompletionQueue.RegisterCallback("SUCCESS", func(payload map[string]interface{}) {
		log.Println(payload)
	})
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

		indexingJobQueue.PushMessage("INDEX_REQUEST", indexRequest)
	}
}

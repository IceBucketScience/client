package index

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config_vars"
	"shared/msg_queue"
)

var indexingJobQueue *msgQueue.DispatcherQueue
var indexingJobCompletionQueue *msgQueue.RecieverQueue

func InitIndexRequestHandler(server *mux.Router, config *configVars.Configuration) {
	indexingJobQueue = msgQueue.CreateDispatcherQueue("indexing_job_queue")
	indexingJobCompletionQueue = msgQueue.CreateRecieverQueue("indexing_job_completion_queue", config.BaseUrl, server)

	server.HandleFunc("/index", handleIndexRequests(config)).
		Methods("POST")

	indexingJobCompletionQueue.RegisterCallback("SUCCESS", func(payload map[string]interface{}) {
		log.Println(payload)
	})
}

type IndexRequestBody struct {
	UserId      string `json:"userId"`
	AccessToken string `json:"accessToken"`
}

func handleIndexRequests(config *configVars.Configuration) func(http.ResponseWriter, *http.Request) {
	return func(rw http.ResponseWriter, req *http.Request) {
		var indexRequest IndexRequestBody
		err := json.NewDecoder(req.Body).Decode(&indexRequest)
		if err != nil {
			log.Panicln(err)
		}

		indexingJobQueue.PushMessage("INDEX_REQUEST", indexRequest)
	}
}

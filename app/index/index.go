package index

import (
	"encoding/json"
	//"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config_vars"
	"client/app/facebook"
	"shared/graph"
	"shared/msg_queue"
)

var indexingJobQueue *msgQueue.DispatcherQueue
var indexingJobCompletionQueue *msgQueue.RecieverQueue

func InitIndexRequestHandler(server *mux.Router, config *configVars.Configuration) error {
	indexingJobQueueObj, indexingJobQueueCreationErr := msgQueue.CreateDispatcherQueue("indexing_job_queue")
	indexingJobCompletionQueueObj, indexingJobCompletionQueueCreationErr := msgQueue.CreateRecieverQueue("indexing_job_completion_queue", config.BaseUrl, server)

	if indexingJobQueueCreationErr != nil {
		return indexingJobQueueCreationErr
	} else if indexingJobCompletionQueueCreationErr != nil {
		return indexingJobCompletionQueueCreationErr
	}

	indexingJobQueue = indexingJobQueueObj
	indexingJobCompletionQueue = indexingJobCompletionQueueObj

	server.HandleFunc("/index", handleIndexRequest(config)).Methods("POST")

	return nil
}

type IndexRequest struct {
	UserId      string `json:"userId"`
	AccessToken string `json:"accessToken"`
}

type AlreadyIndexedResponse struct {
	AlreadyIndexed bool `json:"alreadyIndexed"`
}

func handleIndexRequest(config *configVars.Configuration) func(http.ResponseWriter, *http.Request) {
	return func(rw http.ResponseWriter, req *http.Request) {
		var indexRequest IndexRequest
		parseErr := json.NewDecoder(req.Body).Decode(&indexRequest)
		if parseErr != nil {
			rw.WriteHeader(400)
			log.Panicln(parseErr)
			return
		}

		//Checks to see if a volunteer with this userId already exists. If so,
		//the user has already been indexed. If not, the user still needs to be indexed.
		volunteer, volunteerSearchErr := graph.FindVolunteer(indexRequest.UserId)
		if volunteerSearchErr != nil {
			rw.WriteHeader(400)
			log.Panicln(volunteerSearchErr)
			return
		} else if volunteer != nil {
			json.NewEncoder(rw).Encode(AlreadyIndexedResponse{AlreadyIndexed: true})
			return
		}

		longTermToken, _, exchangeErr := facebook.GetLongTermToken(indexRequest.AccessToken)
		if exchangeErr != nil {
			rw.WriteHeader(400)
			log.Panicln(exchangeErr)
			return
		}

		indexingJobQueue.PushMessage("INDEX_REQUEST", IndexRequest{UserId: indexRequest.UserId, AccessToken: longTermToken})

		indexingErr := waitForIndexingCompletion(indexRequest.UserId)
		if indexingErr != nil {
			rw.WriteHeader(400)
			log.Panicln(indexingErr)
			return
		}

		rw.WriteHeader(200)
	}
}

func waitForIndexingCompletion(userId string) error {
	indexingComplete := make(chan bool)

	successCallbackId := indexingJobCompletionQueue.RegisterCallback("SUCCESS", func(userId string, indexingComplete chan bool) func(map[string]interface{}) {
		//the callback function is returned from a closure to pass the userId and the channel to notify completion of indexing
		return func(payload map[string]interface{}) {
			if payload["userId"] == userId {
				indexingComplete <- true
			}
		}
	}(userId, indexingComplete))
	//TODO: register errorCallback and return and error

	//blocks until indexingComplete recieves true from the callback function
	<-indexingComplete

	indexingJobCompletionQueue.UnregisterCallback(successCallbackId)

	return nil
}

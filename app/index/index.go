package index

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config_vars"
	"shared/facebook"
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

	server.HandleFunc("/index", handleIndexRequest).Methods("POST")

	return nil
}

type IndexRequest struct {
	UserId      string `json:"userId"`
	AccessToken string `json:"accessToken"`
}

type AlreadyIndexedResponse struct {
	AlreadyIndexed bool `json:"alreadyIndexed"`
}

func handleIndexRequest(rw http.ResponseWriter, req *http.Request) {
	var indexRequest IndexRequest
	parseErr := json.NewDecoder(req.Body).Decode(&indexRequest)
	if parseErr != nil {
		rw.WriteHeader(400)
		log.Panicln(parseErr)
		return
	}

	//Checks to see if a volunteer with this userId already exists. If so,
	//the user has already been indexed. If not, the user still needs to be indexed.
	volunteer, volunteerSearchErr := graph.FindIndexedVolunteer(indexRequest.UserId)
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

	pushErr := indexingJobQueue.PushMessage("INDEX_REQUEST", IndexRequest{UserId: indexRequest.UserId, AccessToken: longTermToken})
	if pushErr != nil {
		rw.WriteHeader(400)
		log.Panicln(pushErr)
		return
	}

	indexingErr := waitForIndexingCompletion(indexRequest.UserId)
	if indexingErr != nil {
		rw.WriteHeader(400)
		log.Panicln(indexingErr)
		return
	}

	rw.WriteHeader(200)
}

func waitForIndexingCompletion(userId string) error {
	indexingComplete := make(chan bool)
	var indexingErr error

	successCallbackId := indexingJobCompletionQueue.RegisterCallback("SUCCESS", func(payload map[string]interface{}) {
		if payload["userId"] == userId {
			indexingComplete <- true

		}
	})

	failureCallbackId := indexingJobCompletionQueue.RegisterCallback("FAILURE", func(payload map[string]interface{}) {
		if payload["userId"] == userId {
			indexingErr = errors.New(payload["message"].(string))
			indexingComplete <- true
		}
	})

	//blocks until indexingComplete recieves true from the callback function
	<-indexingComplete

	indexingJobCompletionQueue.UnregisterCallback(successCallbackId)
	indexingJobCompletionQueue.UnregisterCallback(failureCallbackId)

	return indexingErr
}

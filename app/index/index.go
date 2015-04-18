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

type IndexingRequestStatus struct {
	DoneIndexing bool
	IndexingErr  error
}

var currIndexingRequests map[string]IndexingRequestStatus

func InitIndexRequestHandler(server *mux.Router, config *configVars.Configuration) error {
	indexingJobQueueObj, indexingJobQueueCreationErr := msgQueue.CreateDispatcherQueue("indexing_job_queue")
	indexingJobCompletionQueueObj, indexingJobCompletionQueueCreationErr := msgQueue.CreateRecieverQueue("indexing_job_completion_queue", config.BaseUrl, server)

	currIndexingRequests = map[string]IndexingRequestStatus{}

	if indexingJobQueueCreationErr != nil {
		return indexingJobQueueCreationErr
	} else if indexingJobCompletionQueueCreationErr != nil {
		return indexingJobCompletionQueueCreationErr
	}

	indexingJobQueue = indexingJobQueueObj
	indexingJobCompletionQueue = indexingJobCompletionQueueObj

	server.HandleFunc("/index", handleIndexRequest).Methods("POST")
	server.HandleFunc("/indexed/{volunteerId}", handleIsIndexedRequest).Methods("GET")

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
		log.Println(parseErr)
		return
	}

	//Checks to see if a volunteer with this userId already exists. If so,
	//the user has already been indexed. If not, the user still needs to be indexed.
	volunteer, volunteerSearchErr := graph.FindVolunteer(indexRequest.UserId)

	if volunteerSearchErr != nil {
		rw.WriteHeader(400)
		log.Println(volunteerSearchErr)
		return
	}

	currIndexingRequests[indexRequest.UserId] = IndexingRequestStatus{DoneIndexing: false}

	if volunteer == nil {
		longTermToken, _, exchangeErr := facebook.GetLongTermToken(indexRequest.AccessToken)
		if exchangeErr != nil {
			rw.WriteHeader(400)
			log.Println(exchangeErr)
			return
		}

		pushErr := indexingJobQueue.PushMessage("INDEX_REQUEST", IndexRequest{UserId: indexRequest.UserId, AccessToken: longTermToken})
		if pushErr != nil {
			rw.WriteHeader(400)
			log.Println(pushErr)
			return
		}

		log.Println("[SENT INDEX_REQUEST]", indexRequest.UserId)
	} else if volunteer.IsIndexed {
		currIndexingRequests[indexRequest.UserId] = IndexingRequestStatus{DoneIndexing: true}
		rw.WriteHeader(200)
		return
	}

	listenForIndexingCompletion(indexRequest.UserId)

	// log.Println("[INDEX_REQUEST_SUCCESSFUL]", indexRequest.UserId)

	rw.WriteHeader(200)
}

func listenForIndexingCompletion(userId string) {
	indexingJobCompletionQueue.RegisterOnce("SUCCESS", func(payload map[string]interface{}) {
		if payload["userId"] == userId {
			currIndexingRequests[userId] = IndexingRequestStatus{DoneIndexing: true}
			log.Println(currIndexingRequests)
			//indexingJobCompletionQueue.UnregisterCallback(successCallbackId)
		}
	})

	indexingJobCompletionQueue.RegisterOnce("FAILURE", func(payload map[string]interface{}) {
		if payload["userId"] == userId {
			currIndexingRequests[userId] = IndexingRequestStatus{DoneIndexing: true, IndexingErr: errors.New(payload["message"].(string))}
			log.Println(currIndexingRequests)
			//indexingJobCompletionQueue.UnregisterCallback(failureCallbackId)
		}
	})
}

type IsIndexedResponse struct {
	IsIndexed bool `json:"isIndexed"`
}

func handleIsIndexedRequest(rw http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)

	volunteer, volunteerSearchErr := graph.FindVolunteer(vars["volunteerId"])
	resEncoder := json.NewEncoder(rw)
	log.Println(currIndexingRequests)
	currIndexRequest, indexRequestExists := currIndexingRequests[volunteer.FbId]

	if volunteerSearchErr != nil {
		rw.WriteHeader(400)
		log.Println(volunteerSearchErr)
		return
	} else if indexRequestExists {
		if currIndexRequest.IndexingErr != nil {
			rw.WriteHeader(400)
			log.Println(currIndexRequest.IndexingErr)
		} else {
			resEncoder.Encode(IsIndexedResponse{IsIndexed: currIndexRequest.DoneIndexing})
		}

		delete(currIndexingRequests, volunteer.FbId)
	} else {
		rw.WriteHeader(400)
	}
}

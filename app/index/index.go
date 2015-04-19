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

type IsIndexedResponse struct {
	IsIndexed bool `json:"isIndexed"`
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

	if volunteer == nil || !volunteer.IsIndexed {
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
		}

		listenForIndexingCompletion(indexRequest.UserId)

		rw.WriteHeader(200)
	} else if volunteer.IsIndexed {
		json.NewEncoder(rw).Encode(IsIndexedResponse{IsIndexed: true})
		return
	}

	log.Println("END", currIndexingRequests)

	// log.Println("[INDEX_REQUEST_SUCCESSFUL]", indexRequest.UserId)

	rw.WriteHeader(200)
}

func listenForIndexingCompletion(userId string) {
	indexingJobCompletionQueue.RegisterOnce("SUCCESS", func(payload map[string]interface{}) {
		if payload["userId"] == userId {
			currIndexingRequests[userId] = IndexingRequestStatus{DoneIndexing: true}
			log.Println("SUCCESS", currIndexingRequests)
			//indexingJobCompletionQueue.UnregisterCallback(successCallbackId)
		}
	})

	indexingJobCompletionQueue.RegisterOnce("FAILURE", func(payload map[string]interface{}) {
		if payload["userId"] == userId {
			currIndexingRequests[userId] = IndexingRequestStatus{DoneIndexing: true, IndexingErr: errors.New(payload["message"].(string))}
			log.Println("FAILURE", currIndexingRequests)
			//indexingJobCompletionQueue.UnregisterCallback(failureCallbackId)
		}
	})
}

func handleIsIndexedRequest(rw http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)

	volunteer, volunteerSearchErr := graph.FindVolunteer(vars["volunteerId"])
	resEncoder := json.NewEncoder(rw)
	log.Println("IS_INDEXED_START", currIndexingRequests)

	if volunteerSearchErr != nil {
		rw.WriteHeader(400)
		log.Println(volunteerSearchErr)
	} else if volunteer != nil {
		currIndexRequest, indexRequestExists := currIndexingRequests[volunteer.FbId]
		log.Println("CURR_INDEX_REQ", indexRequestExists, currIndexRequest)
		if indexRequestExists {
			if currIndexRequest.IndexingErr != nil {
				rw.WriteHeader(400)
				log.Println(currIndexRequest.IndexingErr)
				delete(currIndexingRequests, volunteer.FbId)
			} else if currIndexRequest.DoneIndexing {
				resEncoder.Encode(IsIndexedResponse{IsIndexed: true})
				delete(currIndexingRequests, volunteer.FbId)
			} else {
				resEncoder.Encode(IsIndexedResponse{IsIndexed: false})
			}
		}
	} else {
		resEncoder.Encode(IsIndexedResponse{IsIndexed: false})
	}
}

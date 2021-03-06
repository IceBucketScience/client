package index

import (
	"encoding/json"
	//"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"client/app/config_vars"
	"shared/facebook"
	"shared/graph"
	"shared/msg_queue"
)

var indexingJobQueue *msgQueue.DispatcherQueue

//var indexingJobCompletionQueue *msgQueue.RecieverQueue

func InitIndexRequestHandler(server *mux.Router, config *configVars.Configuration) error {
	indexingJobQueueObj, indexingJobQueueCreationErr := msgQueue.CreateDispatcherQueue("indexing_job_queue")
	//indexingJobCompletionQueueObj, indexingJobCompletionQueueCreationErr := msgQueue.CreateRecieverQueue("indexing_job_completion_queue", config.BaseUrl, server)

	if indexingJobQueueCreationErr != nil {
		return indexingJobQueueCreationErr
	} /*else if indexingJobCompletionQueueCreationErr != nil {
		return indexingJobCompletionQueueCreationErr
	}*/

	indexingJobQueue = indexingJobQueueObj
	//indexingJobCompletionQueue = indexingJobCompletionQueueObj

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

	if volunteer == nil || volunteer.IndexingErr != "" {
		if volunteer != nil {
			removeErrErr := volunteer.RemoveErr()
			if removeErrErr != nil {
				rw.WriteHeader(400)
				log.Println(removeErrErr)
				return
			}
		}

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
		json.NewEncoder(rw).Encode(IsIndexedResponse{IsIndexed: true})
		return
	}

	//if the function reaches this point, then the crawler is in the process of indexing, but hasn't finished yet
	rw.WriteHeader(200)
}

func handleIsIndexedRequest(rw http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)

	volunteer, volunteerSearchErr := graph.FindVolunteer(vars["volunteerId"])
	resEncoder := json.NewEncoder(rw)

	if volunteerSearchErr != nil {
		rw.WriteHeader(400)
		log.Println(volunteerSearchErr)
		return
	} else if volunteer != nil {
		if volunteer.IndexingErr != "" {
			rw.WriteHeader(400)
			log.Println("[INDEX_REQUEST_FAILURE]", volunteer.IndexingErr)
			return
		} else if volunteer.IsIndexed {
			log.Println("[INDEX_REQUEST_SUCCESSFUL]", volunteer.Name)
			resEncoder.Encode(IsIndexedResponse{IsIndexed: true})
			return
		}

		//if the function reaches this point, then the volunteer exists, but is still in the process of being indexed
		resEncoder.Encode(IsIndexedResponse{IsIndexed: false})
		return
	}

	//if the function reaches this point, then no volunteer was found
	rw.WriteHeader(404)
}

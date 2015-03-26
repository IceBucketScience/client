package msgQueue

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/iron-io/iron_go/mq"
)

type callbackFunc func(map[string]interface{})

type Queue struct {
	Name      string
	IronQueue *mq.Queue
	Callbacks map[string][]callbackFunc
}

func CreateQueue(name string, baseUrl string, server *mux.Router) *Queue {
	callbacks := make(map[string][]callbackFunc)
	ironQueue := mq.New("indexing_job_queue")
	ironQueue.AddSubscribers(baseUrl + "/queues/" + name)

	queue := Queue{Name: name, IronQueue: ironQueue, Callbacks: callbacks}
	server.HandleFunc("/queues/"+name, queue.recieveMessage).Methods("POST")

	return &queue
}

func (queue *Queue) RegisterCallback(msgType string, callback callbackFunc) {
	queue.Callbacks[msgType] = append(queue.Callbacks[msgType], callback)
}

type Message struct {
	Type    string
	Payload interface{}
}

func (queue *Queue) PushMessage(msgType string, payload interface{}) {
	json, marshalErr := json.Marshal(Message{Type: msgType, Payload: payload})
	if marshalErr != nil {
		log.Panicln(marshalErr)
	}

	_, pushErr := queue.IronQueue.PushString(string(json))
	if pushErr != nil {
		log.Panicln(pushErr)
	}
}

func (queue *Queue) recieveMessage(rw http.ResponseWriter, req *http.Request) {
	var message Message
	err := json.NewDecoder(req.Body).Decode(&message)

	if err != nil {
		rw.WriteHeader(400)
		return
	}

	if len(queue.Callbacks[message.Type]) > 0 {
		for _, callback := range queue.Callbacks[message.Type] {
			callback(message.Payload.(map[string]interface{}))
		}
	} else {
		rw.WriteHeader(202)
		return
	}

	rw.WriteHeader(200)
}

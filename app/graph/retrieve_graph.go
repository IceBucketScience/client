package graph

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"shared/graph"
)

func InitGraphRetrievalHandler(server *mux.Router) {
	server.HandleFunc("/graph/{volunteerId}", func(rw http.ResponseWriter, req *http.Request) {
		vars := mux.Vars(req)

		graph, getGraphErr := retrieveGraph(vars["volunteerId"])
		if getGraphErr != nil {
			rw.WriteHeader(400)
			log.Println(getGraphErr)
			return
		}

		rw.Header().Set("Content-Type", "application/json")
		json.NewEncoder(rw).Encode(graph)
	}).Methods("GET")
}

type Person struct {
	Id string `json:"id"`
}

type Friendship struct {
	Id     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

type Graph struct {
	Nodes []*Person     `json:"nodes"`
	Edges []*Friendship `json:"edges"`
}

func retrieveGraph(volunteerId string) (*Graph, error) {
	people, getPeopleErr := getPeopleFromGraphOf(volunteerId)
	if getPeopleErr != nil {
		return nil, getPeopleErr
	}

	friendships, getFriendshipsErr := getFriendshipsFromGraphOf(volunteerId)
	if getFriendshipsErr != nil {
		return nil, getFriendshipsErr
	}

	return &Graph{Nodes: people, Edges: friendships}, nil
}

func getPeopleFromGraphOf(volunteerId string) ([]*Person, error) {
	people := []*Person{}

	volunteer, getVolunteerErr := graph.GetPerson(volunteerId)
	if getVolunteerErr != nil {
		return nil, getVolunteerErr
	}

	people = append(people, &Person{Id: volunteer.FbId})

	friends, getFriendsErr := volunteer.GetFriends()
	if getFriendsErr != nil {
		return nil, getFriendsErr
	}

	for _, friend := range friends {
		person := &Person{Id: friend.FbId}
		people = append(people, person)
	}

	return people, nil
}

func getFriendshipsFromGraphOf(volunteerId string) ([]*Friendship, error) {
	friendships := []*Friendship{}

	rawFriendships, getFriendshipsErr := graph.GetFriendshipsInNetwork(volunteerId)
	if getFriendshipsErr != nil {
		return nil, getFriendshipsErr
	}

	for _, friendshipData := range rawFriendships {
		log.Println(friendshipData)
		friendship := &Friendship{Id: strconv.Itoa(friendshipData.GetRelationshipId()), Source: friendshipData.SourceId, Target: friendshipData.TargetId}
		friendships = append(friendships, friendship)
	}

	return friendships, nil
}

package graph

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"shared/facebook"
	"shared/graph"
)

func InitGraphRetrievalHandler(server *mux.Router) {
	server.HandleFunc("/graph/{volunteerId}", func(rw http.ResponseWriter, req *http.Request) {
		vars := mux.Vars(req)

		if tokenIsValid, tokenValidErr := facebook.TokenIsValid(req.Header.Get("X-ACCESS-TOKEN")); tokenValidErr != nil {
			rw.WriteHeader(400)
			log.Println(tokenValidErr)
			return
		} else if !tokenIsValid {
			rw.WriteHeader(401)
			return
		}

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
	Id            string `json:"id"`
	Name          string `json:"name"`
	TimeNominated int    `json:"timeNominated"`
	TimeCompleted int    `json:"timeCompleted"`
}

type Friendship struct {
	Id            string `json:"id"`
	Source        string `json:"source"`
	Target        string `json:"target"`
	TimeNominated int    `json:"timeNominated"`
}

type Graph struct {
	Nodes            []*Person     `json:"nodes"`
	Edges            []*Friendship `json:"edges"`
	ParticipantNodes []string      `json:"participants"`
	Nominations      []string      `json:"nominations"`
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

	nominations, getNominationsErr := graph.GetFriendshipIdsWithNominations(volunteerId)
	if getNominationsErr != nil {
		return nil, getNominationsErr
	}

	return &Graph{
		Nodes:            people,
		Edges:            friendships,
		ParticipantNodes: getParticipantIds(people),
		Nominations:      nominations,
	}, nil
}

func getPeopleFromGraphOf(volunteerId string) ([]*Person, error) {
	people := []*Person{}

	volunteer, getVolunteerErr := graph.GetPerson(volunteerId)
	if getVolunteerErr != nil {
		return nil, getVolunteerErr
	}

	people = append(people, &Person{Id: volunteer.FbId, Name: volunteer.Name, TimeNominated: volunteer.TimeNominated, TimeCompleted: volunteer.TimeCompleted})

	friends, getFriendsErr := volunteer.GetFriends()
	if getFriendsErr != nil {
		return nil, getFriendsErr
	}

	for _, friend := range friends {
		person := &Person{Id: friend.FbId, Name: friend.Name, TimeNominated: friend.TimeNominated, TimeCompleted: friend.TimeCompleted}
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
		friendship := &Friendship{Id: strconv.Itoa(friendshipData.GetRelationshipId()), Source: friendshipData.SourceId, Target: friendshipData.TargetId}
		friendships = append(friendships, friendship)
	}

	return friendships, nil
}

func getParticipantIds(people []*Person) []string {
	ids := []string{}

	for _, person := range people {
		if person.TimeNominated != 0 {
			ids = append(ids, person.Id)
		}
	}

	return ids
}

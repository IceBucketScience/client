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
		//TODO: add security through submission of accessToken and validation with /debug_token
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

	nominations, getNominationsErr := getNominationIds(friendships)
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

//TODO: note friendships w/ nominations
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

func getNominationIds(friendships []*Friendship) ([]string, error) {
	ids := []string{}
	//TODO: write Cypher query that gets ids of nominations quickly
	/*checkedFriendships := []*Friendship{}
	checkedFriendshipsCh := make(chan *Friendship)
	errCh := make(chan error)

	for _, friendship := range friendships {
		go func(friendship *Friendship) {
			nominationExists, nominationExistsErr := graph.NominationExists(friendship.Source, friendship.Target)
			if nominationExistsErr != nil {
				errCh <- nominationExistsErr
			} else if nominationExists {
				ids = append(ids, friendship.Id)
				checkedFriendshipsCh <- friendship
			}
		}(friendship)
	}

	for len(friendships) > 0 {
		select {
		case checkedFriendship := <-checkedFriendshipsCh:
			checkedFriendships = append(checkedFriendships, checkedFriendship)
		case err := <-errCh:
			return nil, err
		}

		if len(checkedFriendships) == len(friendships) {
			break
		}
	}*/

	return ids, nil
}

package survey

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"shared/graph"
)

type SurveyResponse struct {
	FacebookName    string `json:"facebookName"`
	DidDonate       bool   `json:"didDonate"`
	IsFirstDonation bool   `json:"isFirstDonation"`
	DonationDate    int    `json:"donationDate"`
}

func InitSurveyResponseHandler(server *mux.Router) {
	server.HandleFunc("/survey", func(rw http.ResponseWriter, req *http.Request) {
		var response SurveyResponse
		parseErr := json.NewDecoder(req.Body).Decode(&response)
		if parseErr != nil {
			rw.WriteHeader(400)
			log.Println(parseErr)
			return
		}

		_, createSurveyResErr := graph.CreateSurveyResponse(response.FacebookName, response.DidDonate, response.IsFirstDonation, response.DonationDate)
		if createSurveyResErr != nil {
			rw.WriteHeader(400)
			log.Println(createSurveyResErr)
			return
		}

		rw.WriteHeader(200)
	}).Methods("POST")
}

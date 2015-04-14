var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var TextQuestion = require("./survey-questions/TextQuestion.jsx");
var YesOrNoQuestion = require("./survey-questions/YesOrNoQuestion.jsx");
var DateQuestion = require("./survey-questions/DateQuestion.jsx");

var getUnixTimestampFor = require("../util").getUnixTimestampFor;

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("SurveyStore")],
    getStateFromFlux: function() {
        var flux = this.getFlux();
        var surveyStoreState = flux.store("SurveyStore").getState();

        return {
            facebookName: surveyStoreState.facebookName,
            didDonate: surveyStoreState.didDonate,
            isFirstDonation: surveyStoreState.isFirstDonation,
            donationDate: surveyStoreState.donationDate
        };
    },
    handleFacebookNameChange: function(fbName) {
        this.getFlux().actions.survey.changeSurveyResponse("facebookName", fbName);
    },
    handleDidDonateChange: function(didDonate) {
        this.getFlux().actions.survey.changeSurveyResponse("didDonate", didDonate);
    },
    handleFirstDonationChange: function(isFirstDonation) {
        this.getFlux().actions.survey.changeSurveyResponse("isFirstDonation", isFirstDonation);
    },
    handleDonationDateChange: function(newDate) {
        this.getFlux().actions.survey.changeSurveyResponse("donationDate", newDate);
    },
    surveyIsValid: function() {
        return this.state.facebookName != null && 
            this.state.didDonate != null && 
            (!this.state.didDonate || this.state.isFirstDonation) &&
            this.state.donationDate != null;
    },
    handleSubmit: function(e) {
        e.preventDefault();

        if (this.surveyIsValid()) {
            this.getFlux().actions.survey.submitSurveyResponse(this.state);
        } else {

        }
    },
    render: function() {
        var isFirstDonationQuestion, donationDateQuestion;

        if (this.state.didDonate) {
            isFirstDonationQuestion = <YesOrNoQuestion name="FirstDonation" onChange={this.handleFirstDonationChange}>
                <p>Was this your first time donating to the ALSA?</p>
            </YesOrNoQuestion>;

            donationDateQuestion = <DateQuestion 
                name="DateDonated"
                onChange={this.handleDonationDateChange} 
                minDate={getUnixTimestampFor(2014, 5, 15)}
                maxDate={getUnixTimestampFor(2014, 10, 1)}>
                <p>Test</p>
            </DateQuestion>;
        }
        
        return <form>
            <TextQuestion name="FacebookName" onChange={this.handleFacebookNameChange}>
                What is your full name EXACTLY as it appears on Facebook today?
            </TextQuestion>

            <YesOrNoQuestion name="DidDonate" onChange={this.handleDidDonateChange}>
                <p>Did you donate to the ALS Association between May 15th and October 1st (inclusive)?</p>
            </YesOrNoQuestion>

            {isFirstDonationQuestion}

            {donationDateQuestion}

            <button type="submit" onClick={this.handleSubmit} disabled={!this.surveyIsValid()}>Submit</button>
        </form>;
    }
});
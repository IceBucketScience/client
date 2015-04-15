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
        return this.state.facebookName != null && this.state.facebookName != "" &&
            this.state.didDonate != null && 
            (!this.state.didDonate || (this.state.didDonate && this.state.isFirstDonation != null)) &&
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
            isFirstDonationQuestion = <YesOrNoQuestion 
                name="FirstDonation" 
                isYes={this.state.isFirstDonation}
                onChange={this.handleFirstDonationChange}>
                <label>c) Was this your first time donating to the ALSA?</label>
            </YesOrNoQuestion>;

            donationDateQuestion = <DateQuestion 
                name="DateDonated"
                currDate={this.state.donationDate}
                onChange={this.handleDonationDateChange} 
                minDate={getUnixTimestampFor(2014, 5, 15)}
                maxDate={getUnixTimestampFor(2014, 10, 1)}>
                <label>d) On what day between May 15th and October 1st (inclusive) did you make your donation?</label>
                <span className="help-block">
                    To find out when you donated, you can:
                    <ul>
                        <li>Search your email for the donation receipt sent by the ALSA</li>
                        <li>If you donated when you completed the Ice Bucket Challenge, find your Facebook post about completing the Challenge</li>
                        <li>Search through your credit card or banking transactions to find your donation</li>
                    </ul>
                </span>
            </DateQuestion>;
        }
        
        return <div>
            <form>
                <TextQuestion 
                    name="FacebookName" 
                    value={this.state.facebookName}
                    onChange={this.handleFacebookNameChange}>
                    <label htmlFor="FacebookName">a) What is your full name <em>exactly</em> as it appears on Facebook today?</label>
                </TextQuestion>

                <YesOrNoQuestion 
                    name="DidDonate" 
                    isYes={this.state.didDonate}
                    onChange={this.handleDidDonateChange}>
                    <label> b) Did you donate to the <a href="http://www.alsa.org/">ALS Association</a> between May 15th and October 1st (inclusive)?</label>
                </YesOrNoQuestion>

                {isFirstDonationQuestion}

                {donationDateQuestion}

                <button type="submit" className="btn btn-primary" onClick={this.handleSubmit} disabled={!this.surveyIsValid()}>Submit</button>
            </form>
        </div>;
    }
});
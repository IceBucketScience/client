var Fluxxor = require("fluxxor");

var constants = require("../constants");
var getUnixTimestampFor = require("../util").getUnixTimestampFor;

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.submitted = false;
        
        this.resetSurvey();

        this.bindActions(
            constants.CHANGE_SURVEY_RESPONSE_VALUE, this.onChangedSurveyResponseValue,
            constants.SUBMIT_SURVEY_RESPONSE_SUCCESS, this.onSubmitSurveyResponseSuccess
        );
    },
    resetSurvey: function() {
        this.facebookName = null;
        this.didDonate = null;
        this.isFirstDonation = null;
        this.donationDate = getUnixTimestampFor(2014, 5, 15);
    },
    onChangedSurveyResponseValue: function(payload) {
        this[payload.valueName] = payload.newValue;

        this.emit("change");
    },
    onSubmitSurveyResponseSuccess: function() {
        this.submitted = true;
        this.resetSurvey();

        this.emit("change");
    },
    getState: function() {
        return {
            facebookName: this.facebookName,
            didDonate: this.didDonate,
            isFirstDonation: this.isFirstDonation,
            donationDate: this.donationDate,
            submitted: this.submitted
        };
    }
});
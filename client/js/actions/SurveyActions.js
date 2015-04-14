var constants = require("../constants");

var Promise = require("bluebird");
var request = Promise.promisifyAll(require("superagent"));

module.exports = {
    changeSurveyResponse: function(valueName, newValue) {
        this.dispatch(constants.CHANGE_SURVEY_RESPONSE_VALUE, {valueName: valueName, newValue: newValue});
    },
    submitSurveyResponse: function(surveyResponse) {
        var self = this;

        self.dispatch(constants.SUBMIT_SURVEY_RESPONSE);

        request.post("/survey").send(surveyResponse).endAsync()
        .then(function(res) {
            self.dispatch(constants.SUBMIT_SURVEY_RESPONSE_SUCCESS);
        }, function(err) {
            console.log(err);
            self.dispatch(constants.SUBMIT_SURVEY_RESPONSE_FAILURE);
        });
    }
};
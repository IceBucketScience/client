var Fluxxor = require("fluxxor");

var constants = require("../constants");

var Fb = require("fb");

module.exports = Fluxxor.createStore({
    initialize: function() {
        /*this.userId = null;
        this.accessToken = null;
        this.indexingFb = false;
        this.indexedSuccessfully = false;*/

        this.userId = "100002440675767";
        this.accessToken = "CAACNIT113jEBAFYcOY1HQ2ncXAdKIFzjvI2pDAlD3pOr0xefIhtQFNZAjD465W2GzZC0ZC1HH1V44otbZAZAj7xZAREaMf1WsgaHbtq7QYJBErmec9VwYUxOqpxePGUHR73ccC4aQnSHUMXZB0FaGc68ZAIBRPOYldCpFioWUd5Ujv1VZCQ2yetZCN";
        this.indexingFb = false;
        this.indexedSuccessfully = true;

        this.bindActions(
            constants.FB_LOGIN_SUCCESS, this.onFbLoginSuccess,
            constants.INDEXING_FB, this.onIndexingFB,
            constants.ALREADY_INDEXED, this.onIndexingFBSuccess,
            constants.INDEXING_FB_SUCCESS, this.onIndexingFBSuccess,
            constants.INDEXING_FB_FAILURE, this.onIndexingFBFailure
        );
    },
    onFbLoginSuccess: function(sessionInfo) {
        this.userId = sessionInfo.userId;
        this.accessToken = sessionInfo.accessToken;

        this.emit("change");
    },
    onIndexingFB: function() {
        this.indexingFb = true;

        this.emit("change")
    },
    onIndexingFBSuccess: function() {
        this.indexingFb = false;
        this.indexedSuccessfully = true;

        this.emit("change")
    },
    onIndexingFBFailure: function() {
        this.indexingFb = false;
        this.indexedSuccessfully = false;

        this.emit("change")
    },
    getState: function() {
        return {
            userId: this.userId,
            accessToken: this.accessToken,
            indexingFb: this.indexingFb,
            indexedSuccessfully: this.indexedSuccessfully
        };
    }
});
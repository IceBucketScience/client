var Fluxxor = require("fluxxor");

var constants = require("../constants");

var Fb = require("fb");

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.userId = null;
        this.accessToken = null;
        this.indexingFb = false;

        this.bindActions(
            constants.FB_LOGIN_SUCCESS, this.onFbLoginSuccess,
            constants.INDEXING_FB, this.onIndexingFB,
            constants.ALREADY_INDEXED, this.onIndexingFBSuccess,
            constants.INDEXING_FB_SUCCESS, this.onIndexingFBSuccess
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

        this.emit("change")
    },
    getState: function() {
        return {
            userId: this.userId,
            accessToken: this.accessToken,
            indexingFb: this.indexingFb
        };
    }
});
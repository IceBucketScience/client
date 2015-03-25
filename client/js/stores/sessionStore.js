var Fluxxor = require("fluxxor");

var constants = require("../constants");

var Fb = require("fb");

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.userId = null;
        this.accessToken = null;

        this.bindActions(
            constants.FB_LOGIN_SUCCESS, this.onFbLoginSuccess
        );
    },
    onFbLoginSuccess: function(sessionInfo) {
        this.userId = sessionInfo.userId;
        this.accessToken = sessionInfo.accessToken;

        this.emit("change");
    },
    getState: function() {
        return {
            userId: this.userId,
            accessToken: this.accessToken
        };
    }
});
var constants = require("../constants");

var Fb = require("fb");

module.exports = {
    login: function() {
        var self = this;

        function dispatchLoginSuccess(authResponse) {
            self.dispatch(constants.FB_LOGIN_SUCCESS, {
                userId: authResponse.authResponse.userID,
                accessToken: authResponse.authResponse.accessToken
            });
        }

        self.dispatch(constants.FB_LOGIN);

        Fb.getLoginStatus(function(loginStatusRes) {
            if (loginStatusRes.status === "connected") {
                dispatchLoginSuccess(loginStatusRes);
            } else {
                Fb.login(function(loginRes) {
                    dispatchLoginSuccess(loginRes);
                }, function() {
                    this.dispatch(constants.FB_LOGIN_FAILURE);
                });
            }
        });
    },
    handleAuthStateChange: function(response) {
        if (response.status === "connected") {
            this.dispatch(constants.FB_LOGIN_SUCCESS, {
                userId: response.authResponse.userID,
                accessToken: response.authResponse.accessToken
            });
        }
    }
};
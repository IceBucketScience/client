var constants = require("../constants");

var Fb = require("fb");

var Promise = require("bluebird");
var request = Promise.promisifyAll(require("superagent"));

function attemptFbLogin() {
    return new Promise(function(resolve, reject) {
        Fb.getLoginStatus(function(loginStatusRes) {
            if (loginStatusRes.status === "connected") {
                resolve(loginStatusRes);
            } else {
                Fb.login(function(loginRes) {
                    resolve(loginRes);
                }, function() {
                    reject();
                });
            }
        });
    });
}

function initIndexing(sessionInfo) {
    return request.post("/index").send(sessionInfo).endAsync()
    .then(function(res) {
        return res.alreadyIndexed;
    });
}

module.exports = {
    login: function() {
        var self = this;

        self.dispatch(constants.FB_LOGIN);

        attemptFbLogin()
        .then(function(loginRes) {
            var sessionInfo = {
                userId: loginRes.authResponse.userID,
                accessToken: loginRes.authResponse.accessToken
            };

            self.dispatch(constants.FB_LOGIN_SUCCESS, sessionInfo);
            self.dispatch(constants.INDEXING_FB);

            return initIndexing(sessionInfo);
        }, function() {
            self.dispatch(constants.FB_LOGIN_FAILURE);
        })
        .then(function(alreadyIndexed) {
            if (alreadyIndexed) {
                self.dispatch(constants.ALREADY_INDEXED);
            } else {
                self.dispatch(constants.INDEXING_FB_SUCCESS);
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
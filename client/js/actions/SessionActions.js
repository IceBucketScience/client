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

function checkIfIndexed(sessionInfo) {
    return request.get("/people/" + sessionInfo.userId).endAsync()
    .then(function(res) {
        console.log(res);
    });
}

function initIndexing(sessionInfo) {
    return request.post("/index").send(sessionInfo).endAsync()
    .then(function(res) {
        console.log(res);
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

            return [checkIfIndexed(sessionInfo), sessionInfo];
        }, function() {
            self.dispatch(constants.FB_LOGIN_FAILURE);
        })
        .spread(function(isIndexed, sessionInfo) {
            if (isIndexed) {
                return sessionInfo;
            } else {
                self.dispatch(constants.INDEXING_FB)

                return initIndexing(sessionInfo);
            }
        })
        .then(function(sessionInfo) {

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
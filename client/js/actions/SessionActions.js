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
                    if (loginRes.authResponse) {
                        resolve(loginRes);
                    } else {
                        reject();
                    }
                },
                {
                    scope: "read_stream"
                });
            }
        });
    });
}

function initIndexing(sessionInfo) {
    return request.post("/index").send(sessionInfo).endAsync()
    .then(function() {
        return new Promise(function(resolve, reject) {
            var interval = setInterval(function() {
                request.get("/indexed/" + sessionInfo.userId).endAsync()
                .then(function(rawRes) {
                    var res = JSON.parse(rawRes.text);
                    if (res.isIndexed) {
                        clearInterval(interval);
                        resolve();
                    }
                }, function(err) {
                    reject(err);
                });
            }, 10 * 1000);
        });
    });
}

function loadGraph(userId, accessToken) {
    return request.get("/graph/" + userId).accept("json").set("X-ACCESS-TOKEN", accessToken).endAsync()
    .then(function(graph) {
        return JSON.parse(graph.text);
    });
}

module.exports = {
    login: function() {
        var self = this;
        var sessionInfo;

        self.dispatch(constants.FB_LOGIN);

        attemptFbLogin()
        .then(function(loginRes) {
            sessionInfo = {
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
        }, function() {
            self.dispatch(constants.INDEXING_FB_FAILURE);
        })
        .then(function() {
            self.dispatch(constants.LOADING_ICE_BUCKET_MAP);
            return loadGraph(sessionInfo.userId, sessionInfo.accessToken)
        })
        .then(function(graph) {
            self.dispatch(constants.LOADING_ICE_BUCKET_MAP_SUCCESS, graph);
        }, function(err) {
            self.dispatch(constants.LOADING_ICE_BUCKET_MAP_FAILURE);
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
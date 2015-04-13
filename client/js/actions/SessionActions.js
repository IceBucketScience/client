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
    .then(function(res) {
        return res.alreadyIndexed;
    });
}

function loadGraph(userId) {
    return request.get("/graph/" + userId).accept("json").endAsync()
    .then(function(graph) {
        return JSON.parse(graph.text);
    });
}

module.exports = {
    login: function() {
        var self = this;
        var sessionInfo;

        self.dispatch(constants.FB_LOGIN);

        /*attemptFbLogin()
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
            return loadGraph(sessionInfo.userId)
        })*/
        self.dispatch(constants.FB_LOGIN_SUCCESS, {
                userId: "100002440675767",
                accessToken: "CAACNIT113jEBAFYcOY1HQ2ncXAdKIFzjvI2pDAlD3pOr0xefIhtQFNZAjD465W2GzZC0ZC1HH1V44otbZAZAj7xZAREaMf1WsgaHbtq7QYJBErmec9VwYUxOqpxePGUHR73ccC4aQnSHUMXZB0FaGc68ZAIBRPOYldCpFioWUd5Ujv1VZCQ2yetZCN"
            });
        self.dispatch(constants.INDEXING_FB_SUCCESS);
        self.dispatch(constants.LOADING_ICE_BUCKET_MAP);
        loadGraph("100002440675767")
        .then(function(graph) {
            self.dispatch(constants.LOADING_ICE_BUCKET_MAP_SUCCESS, graph);
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
var Fluxxor = require("fluxxor");

var constants = require("../constants");

var Fb = require("fb");

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.userId = null;
        this.accessToken = null;
        this.indexingFb = false;
        this.indexedSuccessfully = false;
        this.loadingGraph = false;
        this.graphLoadedSuccessfully = false;

        this.bindActions(
            constants.FB_LOGIN_SUCCESS, this.onFbLoginSuccess,

            constants.INDEXING_FB, this.onIndexingFB,
            constants.ALREADY_INDEXED, this.onIndexingFBSuccess,
            constants.INDEXING_FB_SUCCESS, this.onIndexingFBSuccess,
            constants.INDEXING_FB_FAILURE, this.onIndexingFBFailure,

            constants.LOADING_ICE_BUCKET_MAP, this.onLoadingIceBucketMap,
            constants.LOADING_ICE_BUCKET_MAP_SUCCESS, this.onLoadingIceBucketMapSuccess,
            constants.LOADING_ICE_BUCKET_MAP_FAILURE, this.onLoadingIceBucketMapFailure
        );
    },
    onFbLoginSuccess: function(sessionInfo) {
        this.userId = sessionInfo.userId;
        this.accessToken = sessionInfo.accessToken;

        this.emit("change");
    },
    onIndexingFB: function() {
        this.indexingFb = true;

        this.emit("change");
    },
    onIndexingFBSuccess: function() {
        this.indexingFb = false;
        this.indexedSuccessfully = true;

        this.emit("change");
    },
    onIndexingFBFailure: function() {
        this.indexingFb = false;
        this.indexedSuccessfully = false;

        this.emit("change");
    },
    onLoadingIceBucketMap: function() {
        this.loadingGraph = true;
        this.graphLoadedSuccessfully = false;

        this.emit("change");
    },
    onLoadingIceBucketMapSuccess: function() {
        this.loadingGraph = false;
        this.graphLoadedSuccessfully = true;

        this.emit("change");
    },
    onLoadingIceBucketMapFailure: function() {
        this.loadingGraph = false;
        this.graphLoadedSuccessfully = false;

        this.emit("change");
    },
    getState: function() {
        return {
            userId: this.userId,
            accessToken: this.accessToken,
            indexingFb: this.indexingFb,
            indexedSuccessfully: this.indexedSuccessfully,
            loadingGraph: this.loadingGraph,
            graphLoadedSuccessfully: this.graphLoadedSuccessfully
        };
    }
});
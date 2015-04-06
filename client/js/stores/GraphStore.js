var Fluxxor = require("fluxxor");

var constants = require("../constants");

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.nodes = [];
        this.edges = [];

        this.bindActions(
            constants.LOADING_ICE_BUCKET_MAP_SUCCESS, this.onLoadingIceBucketMapSuccess
        );
    },
    onLoadingIceBucketMapSuccess: function(graph) {
        this.nodes = graph.nodes;
        this.edges = graph.edges;

        this.emit("change");
    },
    getState: function() {
        return {
            nodes: this.nodes,
            edges: this.edges
        };
    }
});
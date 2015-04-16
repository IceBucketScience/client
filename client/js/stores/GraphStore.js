var Fluxxor = require("fluxxor");

var constants = require("../constants");

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.nodes = [];
        this.edges = [];
        this.participants = [];
        this.nominations = [];

        this.nodesMap = {};
        this.edgesMap = {};

        this.currNominated = [];
        this.currCompleted = [];
        this.activeNominations = [];

        this.bindActions(
            constants.LOADING_ICE_BUCKET_MAP_SUCCESS, this.onLoadingIceBucketMapSuccess,
            constants.UPDATE_GRAPH, this.onUpdateGraph
        );
    },
    onLoadingIceBucketMapSuccess: function(graph) {
        var self = this;

        self.nodes = graph.nodes.map(function(node) {
            self.nodesMap[node.id] = node;
            return node;
        });

        self.edges = graph.edges.filter(function(edge) {
            var isValidEdge = self.nodesMap[edge.target] && self.nodesMap[edge.source];
            if (isValidEdge) {
                self.edgesMap[edge.id] = edge;
            }

            return isValidEdge;
        });

        self.participants = graph.participants;
        self.nominations = graph.nominations;

        self.emit("change");
    },
    onUpdateGraph: function(payload) {
        var self = this;

        var currentPlayTime = payload.currentPlayTime;

        self.currNominated = [];
        self.currCompleted = [];

        self.participants.forEach(function(nodeId) {
            var node = self.nodesMap[nodeId];
            
            if (node.timeCompleted !== 0 && node.timeCompleted <= currentPlayTime) {
                self.currCompleted.push(node.id);
            } else if (node.timeNominated <= currentPlayTime) {
                self.currNominated.push(node.id);
            }
        });

        self.nominations.forEach(function(edgeId) {
            var edge = self.edgesMap[edgeId];
            var source = self.nodesMap[edge.source];
            var target = self.nodesMap[edge.target];
            
            if (source.timeNominated <= currentPlayTime && target.timeNominated <= currentPlayTime) {
                self.activeNominations.push(edgeId);
            }
        });

        self.emit("change");
    },
    getState: function() {
        return {
            nodes: this.nodes,
            edges: this.edges,
            participants: this.participants,
            nominations: this.nominations,
            currNominated: this.currNominated,
            currCompleted: this.currCompleted,
            activeNominations: this.activeNominations
        };
    }
});
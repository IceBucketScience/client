var Fluxxor = require("fluxxor");

var constants = require("../constants");

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.updatePeriod = 0; //the number of milliseconds between each graph display update
        this.timelinePeriod = 86400 / 8; //the number of seconds that pass in the visualization for each updatePeriod
        this.startTime = 1400360100 + 8 * 75 * this.timelinePeriod;
        this.endTime = 1409313300;

        this.isPlaying = false;
        this.currentPlayTime = this.startTime;

        this.bindActions(
            constants.START_GRAPH_PLAYER, this.onStartGraphPlayer,
            constants.PAUSE_GRAPH_PLAYER, this.onPauseGraphPlayer,
            constants.UPDATE_GRAPH, this.onUpdateGraph
        );
    },
    onStartGraphPlayer: function(payload) {
        this.updatePeriod = payload.period;
        this.isPlaying = true;

        this.emit("change");
    },
    onPauseGraphPlayer: function() {
        this.isPlaying = false;

        this.emit("change");
    },
    onUpdateGraph: function(payload) {
        this.currentPlayTime = payload.currentPlayTime;

        this.emit("change");
    },
    getState: function() {
        return {
            updatePeriod: this.updatePeriod,
            timelinePeriod: this.timelinePeriod,
            startTime: this.startTime,
            endTime: this.endTime,

            isPlaying: this.isPlaying,
            currentPlayTime: this.currentPlayTime
        };
    }
});
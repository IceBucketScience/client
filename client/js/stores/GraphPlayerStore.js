var Fluxxor = require("fluxxor");
var moment = require("moment");

var getUnixTimestampFor = require("../util").getUnixTimestampFor;
var constants = require("../constants");

module.exports = Fluxxor.createStore({
    initialize: function() {
        this.updatePeriod = 0; //the number of milliseconds between each graph display update
        this.timelinePeriod = 0; //the number of seconds that pass in the visualization for each updatePeriod
        this.startTime = getUnixTimestampFor(2014, 5, 15);
        this.endTime = getUnixTimestampFor(2014, 10, 1);

        this.isPlaying = false;
        this.currentPlayTime = this.startTime;

        this.bindActions(
            constants.START_GRAPH_PLAYER, this.onStartGraphPlayer,
            constants.PAUSE_GRAPH_PLAYER, this.onPauseGraphPlayer,
            constants.CHANGE_TIMELINE_PERIOD, this.onChangeTimelinePeriod,
            constants.RESTART_GRAPH_PLAYER, this.onRestartGraphPlayer,
            constants.UPDATE_GRAPH, this.onUpdateGraph
        );
    },
    onStartGraphPlayer: function(payload) {
        this.updatePeriod = payload.updatePeriod;
        this.timelinePeriod = payload.timelinePeriod;
        this.isPlaying = true;

        this.emit("change");
    },
    onPauseGraphPlayer: function() {
        this.isPlaying = false;

        this.emit("change");
    },
    onChangeTimelinePeriod: function(payload) {
        this.timelinePeriod = payload.timelinePeriod;

        this.emit("change");
    },
    onRestartGraphPlayer: function() {
        this.isPlaying = false;
        this.currentPlayTime = this.startTime;

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
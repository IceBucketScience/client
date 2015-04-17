var constants = require("../constants");

module.exports = {
    startGraphPlayer: function(updatePeriod, timelinePeriod) {
        this.dispatch(constants.START_GRAPH_PLAYER, {updatePeriod: updatePeriod, timelinePeriod: timelinePeriod});
    },
    pauseGraphPlayer: function() {
        this.dispatch(constants.PAUSE_GRAPH_PLAYER);
    },
    changePlaySpeed: function(newPeriod) {
        this.dispatch(constants.CHANGE_TIMELINE_PERIOD, {timelinePeriod: newPeriod});
    },
    restartGraphPlayer: function() {
        this.dispatch(constants.RESTART_GRAPH_PLAYER);
    },
    updateGraph: function(currentPlayTime) {
        this.dispatch(constants.UPDATE_GRAPH, {currentPlayTime: currentPlayTime});
    }
};
var constants = require("../constants");

module.exports = {
    startGraphPlayer: function(period) {
        this.dispatch(constants.START_GRAPH_PLAYER, {period: period});
    },
    pauseGraphPlayer: function() {
        this.dispatch(constants.PAUSE_GRAPH_PLAYER);
    },
    updateGraph: function(currentPlayTime) {
        this.dispatch(constants.UPDATE_GRAPH, {currentPlayTime: currentPlayTime});
    }
};
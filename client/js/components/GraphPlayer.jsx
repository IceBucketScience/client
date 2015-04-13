var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Graph = require("./Graph.jsx");

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("GraphPlayerStore", "GraphStore")],
    getInitialState: function() {
        return {
            currInterval: null
        };
    },
    getStateFromFlux: function() {
        var flux = this.getFlux();

        return {
            graphPlayer: flux.store("GraphPlayerStore").getState(),
            graph: flux.store("GraphStore").getState()
        };
    },
    startGraphPlayer: function(e) {
        e.preventDefault();

        this.getFlux().actions.graphPlayer.startGraphPlayer(500);
    },
    pauseGraphPlayer: function(e) {
        e.preventDefault();

        this.getFlux().actions.graphPlayer.pauseGraphPlayer();
    },
    componentDidUpdate: function(prevProps, prevState) {
        var self = this;

        if (!prevState.graphPlayer.isPlaying && self.state.graphPlayer.isPlaying) {
            //then graphPlayer just started
            var interval = setInterval(function() {
                var currentPlayTime = self.state.graphPlayer.currentPlayTime;
                var timelinePeriod = self.state.graphPlayer.timelinePeriod;

                if (self.state.graphPlayer.endTime < currentPlayTime) {
                    self.getFlux().actions.graphPlayer.pauseGraphPlayer();
                } else {
                    self.getFlux().actions.graphPlayer.updateGraph(currentPlayTime + timelinePeriod);
                }
            }, self.state.graphPlayer.updatePeriod);

            self.setState({
                currInterval: interval
            });
        } else if (prevState.graphPlayer.isPlaying && !self.state.graphPlayer.isPlaying) {
            //then graphPlayer just paused
            clearInterval(self.state.currInterval);
            self.setState({currInterval: null});
        }
    },
    render: function() {
        return <div>
            <Graph graph={this.state.graph} />
            <a href="#" onClick={this.startGraphPlayer}>Start Graph</a>
            <a href="#" onClick={this.pauseGraphPlayer}>Pause Graph</a>
            <p>{this.state.graphPlayer.currentPlayTime}</p>
        </div>;
    }
});
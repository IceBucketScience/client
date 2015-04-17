var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;
var moment = require("moment");

var Graph = require("./Graph.jsx");

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("GraphPlayerStore", "GraphStore")],
    getInitialState: function() {
        var secondsPerDay = 60 * 60 * 24;

        return {
            currInterval: null,
            currSpeed: "NORMAL",
            speeds: {
                SLOW: secondsPerDay / 8,
                NORMAL: secondsPerDay / 4,
                FAST: secondsPerDay * 2
            }
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
        this.getFlux().actions.graphPlayer.startGraphPlayer(250, this.state.speeds[this.state.currSpeed]);
    },
    pauseGraphPlayer: function(e) {
        this.getFlux().actions.graphPlayer.pauseGraphPlayer();
    },
    setPlaySpeed: function(newSpeed) {
        var self = this;

        return function(e) {
            self.state.currSpeed = newSpeed;
            self.getFlux().actions.graphPlayer.changePlaySpeed(self.state.speeds[newSpeed]);
        }
    },
    restartGraphPlayer: function(e) {
        this.getFlux().actions.graphPlayer.restartGraphPlayer();
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
        var playClasses = "btn btn-success";
        if (this.state.graphPlayer.isPlaying) {
            playClasses += " active";
        }

        var pauseClasses = "btn btn-warning";
        if (!this.state.graphPlayer.isPlaying) {
            pauseClasses += " active";
        }

        var defSpeedSettingClasses = "btn btn-default";
        var speedSettingClasses;
        if (this.state.currSpeed === "SLOW") {
            speedSettingClasses = {
                SLOW: defSpeedSettingClasses + " active",
                NORMAL: defSpeedSettingClasses,
                FAST: defSpeedSettingClasses
            };
        } else if (this.state.currSpeed === "NORMAL") {
            speedSettingClasses = {
                SLOW: defSpeedSettingClasses,
                NORMAL: defSpeedSettingClasses + " active",
                FAST: defSpeedSettingClasses
            };
        } else if (this.state.currSpeed === "FAST") {
            speedSettingClasses = {
                SLOW: defSpeedSettingClasses,
                NORMAL: defSpeedSettingClasses,
                FAST: defSpeedSettingClasses + " active"
            };
        } 

        return <div className="col-sm-12">
            <div className="row">
                <div className="col-sm-12">
                    <p>Below is a visualization of your Facebook network. <strong style={{color: "#858585"}}>Dark gray</strong> dots--called nodes-represent people in your network, and <strong style={{color: "#ddd"}}>light gray</strong> lines indicate friendships between people. You are represented by a larger node. You can mouse over any node to see the name of the corresponding person. To zoom in or out, scroll or pinch. To pan around, click and drag with your mouse.</p>
                    <p>Click the "Start" button below to watch the Ice Bucket Challenge propagate through your network over time. You can change the speed at which the animation plays by toggling bewteen the different speed settings below. <strong style={{color: "#f0ad4e"}}>Yellow</strong> nodes are people who have been nominated for the Challenge, <strong style={{color: "#5bc0de"}}>light blue</strong> nodes are people who have completed the Challenge, and <strong style={{color: "#337ab7"}}>royal blue</strong> lines highlight nominations.</p>
                    <p><strong>WARNING: Playing the animation can cause serious lag on less-powerful computers.</strong></p>
                </div>
            </div>
            <Graph graph={this.state.graph} />
            <div className="row">
                <div className="col-sm-9 btn-toolbar" style={{marginTop: 20}}>
                <div className="btn-group">
                    <button className={playClasses} onClick={this.startGraphPlayer} disabled={!this.state.graph.graphLoaded}>Start</button>
                    <button className={pauseClasses} onClick={this.pauseGraphPlayer} disabled={!this.state.graph.graphLoaded}>Pause</button>
                </div>
                <div className="btn-group"><button className="btn btn-danger" onClick={this.restartGraphPlayer}>Restart</button></div>
                <div className="btn-group">
                    <button className={speedSettingClasses.SLOW} onClick={this.setPlaySpeed("SLOW")}>Slow</button>
                    <button className={speedSettingClasses.NORMAL} onClick={this.setPlaySpeed("NORMAL")}>Normal</button>
                    <button className={speedSettingClasses.FAST} onClick={this.setPlaySpeed("FAST")}>Fast</button>
                </div>
                </div>
                <div className="col-sm-3 text-right">
                    <h3>{moment.unix(this.state.graphPlayer.currentPlayTime).format("MMM Do, YYYY")}</h3>
                </div>
            </div>
        </div>;
    }
});
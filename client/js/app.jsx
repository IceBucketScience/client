var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Fb = require("fb");

Fb.init({
    appId: "155173904571953",
    version: "v1.0",
    status: true,
    cookie: true,
    xfbml: true
});

var SessionStore = require("./stores/SessionStore");
var GraphPlayerStore = require("./stores/GraphPlayerStore");
var GraphStore = require("./stores/GraphStore");
var SurveyStore = require("./stores/SurveyStore");

var stores = {
    SessionStore: new SessionStore(),
    GraphPlayerStore: new GraphPlayerStore(),
    GraphStore: new GraphStore(),
    SurveyStore: new SurveyStore()
};

var SessionActions = require("./actions/SessionActions");
var GraphPlayerActions = require("./actions/GraphPlayerActions");
var SurveyActions = require("./actions/SurveyActions");

var actions = {
    session: SessionActions,
    graphPlayer: GraphPlayerActions,
    survey: SurveyActions
};

var Block = require("./components/Block.jsx");
var FbLoginPanel = require("./components/FbLoginPanel.jsx");
var GraphPlayer = require("./components/GraphPlayer.jsx");
var Survey = require("./components/Survey.jsx");

var App = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("SessionStore", "GraphStore")],
    getInitialState: function() {
        return {
            graphShown: false
        };
    },
    getStateFromFlux: function() {
        var flux = this.getFlux();

        return {
            session: flux.store("SessionStore").getState()
        };
    },
    handleShowGraph: function() {
        this.setState({graphShown: true});
    },
    render: function() {
        return <div className="container">
                <div className="row">
                    <div className="col-sm-10 col-sm-offset-1">
                        <h1 className="text-center">How do social connections affect our philanthropic behavior?</h1>
                        <div className="row" style={{marginTop: 24}}>
                            <div className="col-sm-3">
                                <img className="img-responsive img-circle" src="/static/assets/brad_photo.jpg" style={{width: "100%", marginLeft: "auto", marginRight: "auto"}}/>
                            </div>
                            <div className="col-sm-9">
                                <h4 className="lead">I'm Brad Ross, and for my high school senior thesis project, I want to explore this topic by studying the <a href="http://www.alsa.org/fight-als/ice-bucket-challenge.html">#ALSIceBucketChallenge</a>. To do so, <strong>I need you to answer a few questions and allow a program I wrote to analyze posts on your 5/14 - 9/14 News Feed.</strong> I promise I'll protect your privacy--see below for details.</h4>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <h4 className="lead">My access to Facebook data will disappear in less than two weeks, so <strong>I need you to let my program analyze your network in the next few days</strong> in order to complete my work. If you're interested in seeing the results, shoot me an email at brad.ross.35@gmail.com. Thanks in advance!</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <Block
                        size="6"
                        description="Index Your Facebook">
                        <FbLoginPanel session={this.state.session} />
                    </Block>

                    <Block
                        size="6"
                        description="Fill Out This Short Survey">
                        <Survey />
                    </Block>
                </div>

                <div className="row">
                    <Block
                        size="12"
                        description="Explore the Ice Bucket Challenge in Your Network">
                        <GraphPlayer />
                    </Block>
                </div>

                <div className="row">
                    <div className="col-sm-8 col-sm-offset-2 text-center">
                        <h1>Isn't This Cool?</h1>
                        <h3 className="lead">If you think so (I certainly do), <strong>please share this with your friends</strong> through Facebook or another social media platform of choice.</h3>
                    </div>
                </div>
            </div>;
    }
});

var flux = new Fluxxor.Flux(stores, actions);

React.render(<App flux={flux} />, document.getElementById("app"));
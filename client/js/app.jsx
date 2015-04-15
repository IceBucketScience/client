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

var Step = require("./components/Step.jsx");
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
        var graphPlayer
        if (this.state.graphShown) {
            graphPlayer = <div>
                <GraphPlayer />
            </div>;
        } else if (this.state.session.graphLoadedSuccessfully) {
            graphPlayer = <button className="btn btn-primary" onClick={this.handleShowGraph}>Show Graph</button>;
        }

        return <div className="container">
                <Step 
                    stepNumber="1"
                    stepDescription="Login with Facebook">
                    <FbLoginPanel session={this.state.session} />

                    {graphPlayer}
                </Step>

                <Step
                    stepNumber="2"
                    stepDescription="Fill Out this Short Survey">
                    <Survey />
                </Step>

                <Step
                    stepNumber="3"
                    stepDescription="Share with Your Friends">
                    <p>Post this on your favorite social media outlets so your friends can see their own Ice Bucket Challenge map (and help me with my project in the process!)</p>
                </Step>
            </div>;
    }
});

var flux = new Fluxxor.Flux(stores, actions);

React.render(<App flux={flux} />, document.getElementById("app"));
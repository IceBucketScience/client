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

var FbLoginView = require("./components/FbLoginView.jsx");
var LoggedInView = require("./components/LoggedInView.jsx");
var GraphPlayer = require("./components/GraphPlayer.jsx");
var Survey = require("./components/Survey.jsx");

var App = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("SessionStore", "GraphStore")],
    componentDidMount: function() {
        //Fb.Event.subscribe("auth.authResponseChange", this.getFlux().actions.session.handleAuthStateChange);
    },
    getStateFromFlux: function() {
        var flux = this.getFlux();

        return {
            session: flux.store("SessionStore").getState()
        };
    },
    isLoggedIn: function() {
        return this.state.session.userId !== null;
    },
    render: function() {
        var fbPanelContents

        if (this.isLoggedIn()) {
            fbPanelContents = <LoggedInView session={this.state.session}/>;
        } else {
            fbPanelContents = <FbLoginView />;
        }

        if (this.state.session.graphLoadedSuccessfully) {
            return <div>
                {fbPanelContents}

                <Survey />

                <GraphPlayer />
            </div>;
        } else {
            return <div>
                {fbPanelContents}

                <Survey />
            </div>;
        }
    }
});

var flux = new Fluxxor.Flux(stores, actions);

React.render(<App flux={flux} />, document.getElementById("app"));
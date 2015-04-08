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
var GraphStore = require("./stores/GraphStore");

var stores = {
    SessionStore: new SessionStore(),
    GraphStore: new GraphStore()
};

var SessionActions = require("./actions/SessionActions");

var actions = {
    session: SessionActions
};

var FbLoginView = require("./components/FbLoginView.jsx");
var LoggedInView = require("./components/LoggedInView.jsx");
var Graph = require("./components/Graph.jsx");

var App = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("SessionStore", "GraphStore")],
    componentDidMount: function() {
        //Fb.Event.subscribe("auth.authResponseChange", this.getFlux().actions.session.handleAuthStateChange);
    },
    getStateFromFlux: function() {
        var flux = this.getFlux();

        return {
            session: flux.store("SessionStore").getState(),
            graph: flux.store("GraphStore").getState()
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

        return <div>
            {fbPanelContents}

            <Graph graph={this.state.graph} />
        </div>;
    }
});

var flux = new Fluxxor.Flux(stores, actions);

React.render(<App flux={flux} />, document.getElementById("app"));
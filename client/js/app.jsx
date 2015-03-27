var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Fb = require("fb");

Fb.init({
    appId: "155173904571953",
    status: true,
    cookie: true,
    xfbml: true
});

var SessionStore = require("./stores/SessionStore");

var stores = {
    SessionStore: new SessionStore()
};

var SessionActions = require("./actions/SessionActions");

var actions = {
    session: SessionActions
};

var FbLogin = require("./components/FbLogin.jsx");

var App = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin("SessionStore")],
    componentDidMount: function() {
        //Fb.Event.subscribe("auth.authResponseChange", this.getFlux().actions.session.handleAuthStateChange);
    },
    getStateFromFlux: function() {
        var flux = this.getFlux();

        return {
            session: flux.store("SessionStore").getState()
        };
    },
    
    render: function() {
        return <div>
            <FbLogin session={this.state.session}/>
        </div>;
    }
});

var flux = new Fluxxor.Flux(stores, actions);

React.render(<App flux={flux} />, document.getElementById("app"));
var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],
    login: function(e) {
        e.preventDefault();
        
        this.getFlux().actions.session.login();
    },
    isLoggedIn: function() {
        return this.props.session.userId !== null;
    },
    render: function() {
        if (this.isLoggedIn()) {
            return <p>youre already logged in!</p>
        } else {
            return <a href="#" onClick={this.login}>Login</a>;
        }
    }
});
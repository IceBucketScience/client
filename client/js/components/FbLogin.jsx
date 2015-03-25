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
            return <div>
                <h1>{this.props.session.userId}</h1>

                <p>youre logged in!</p>
            </div>;
        } else {
            return <div>
                <h1>Please click the Login Button</h1>

                <a href="#" onClick={this.login}>Login</a>
            </div>;
        }
    }
});
var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],
    login: function(e) {
        e.preventDefault();
        
        this.getFlux().actions.session.login();
    },
    render: function() {
        return <div>
            <p>Please click the Login Button</p>

            <a href="#" onClick={this.login}>Login</a>
        </div>;
    }
});
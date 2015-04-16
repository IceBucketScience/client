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
        return <div className="text-center">
            <p className="lead">Please click the button below to allow my code to index your Facebook.</p>
            <p>The program will <strong>only read your friend list and you and your friends' Ice Bucket Challenge posts. It CANNOT post anything.</strong> I will not store any other data on my server, and none of your data will be made public in the course of my research. After I complete my project, I will permanently delete your information from my database.</p>

            <div className="row"><div className="col-sm-4 col-sm-offset-4"><button className="btn btn-primary" onClick={this.login}>Login to Facebook</button></div></div>
        </div>;
    }
});
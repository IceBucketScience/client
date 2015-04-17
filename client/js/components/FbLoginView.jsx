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
            <div className="row"><div className="col-sm-12"><p className="lead">Please click the button below to have my server analyze your network.</p></div></div>
            <div className="row"><div className="col-sm-8 col-sm-offset-2"><button className="btn btn-primary btn-block" onClick={this.login}>Index Your Facebook</button></div></div>
            <div className="row"><div className="col-sm-12"><p style={{marginTop: 20}}>The program will <strong>map your friendships and only access Ice Bucket Challenge-related posts on your historical News Feed. It CANNOT post anything.</strong> I will not store any other data on my server, and none of your data will be made public in the course of my research. After I complete my project, I will permanently delete your information from my database.</p></div></div>
        </div>;
    }
});
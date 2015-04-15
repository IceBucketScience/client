var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var FbLoginView = require("./FbLoginView.jsx");
var LoggedInView = require("./LoggedInView.jsx");

module.exports = React.createClass({
    mixins: [FluxMixin],
    isLoggedIn: function() {
        return this.props.session.userId !== null;
    },
    render: function() {
        var fbPanelContents
        if (this.isLoggedIn()) {
            fbPanelContents = <LoggedInView session={this.props.session}/>;
        } else {
            fbPanelContents = <FbLoginView />;
        }

        return <div>
            {fbPanelContents}
        </div>;
    }
});
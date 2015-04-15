var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],
    render: function() {
        var containerContents
        if (this.props.session.indexingFb) {
            containerContents = <p>indexing...</p>;
        } else if (this.props.session.indexedSuccessfully && this.props.session.loadingGraph) {
            containerContents = <p>loading graph...</p>;
        } else if (this.props.session.graphLoadedSuccessfully) {
            containerContents = <p>thank you for indexing! Click the link below to see the Challenge propogate through your network!</p>;
        } else {
            containerContents = <p>whoops! There was an error while indexing.</p>;
        }
        
        return <div>
            {containerContents}
        </div>;
    }
});
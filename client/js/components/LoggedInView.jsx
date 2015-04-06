var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],
    render: function() {
        if (this.props.session.indexingFb) {
            return <div>
                <p>indexing...</p>
            </div>;
        } else if (this.props.session.indexedSuccessfully && this.props.session.loadingGraph) {
            return <div>
                <p>loading graph...</p>
            </div>;
        } else if (this.props.session.graphLoadedSuccessfully) {
            return <div>
                <p>thank you for indexing! Click the link below to see the Challenge propogate through your network!</p>
            </div>;
        }
        
        return <div>
            <p>whoops! There was an error while indexing.</p>
        </div>;
    }
});
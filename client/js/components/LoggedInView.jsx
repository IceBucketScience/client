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
        } else if (this.props.session.indexedSuccessfully) {
            return <div>
                <p>thank you for indexing!</p>
            </div>;
        } else {
            return <div>
                <p>whoops! There was an error while indexing.</p>
            </div>;
        }
    }
});
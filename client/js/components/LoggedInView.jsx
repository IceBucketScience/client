var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],
    isIndexing: function() {
        return this.props.session.indexingFb;
    },
    render: function() {
        if (this.isIndexing()) {
            return <div>
                <p>indexing...</p>
            </div>;
        } else {
            return <div>
                <p>thank you for indexing!</p>
            </div>;
        }
    }
});
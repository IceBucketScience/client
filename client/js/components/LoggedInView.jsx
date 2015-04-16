var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],
    render: function() {
        var containerContents;
    
        if (this.props.session.indexingFb) {
            containerContents = <div>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped active" style={{width: "25%"}}></div>
                </div>
                <p><strong>Step 1 of 2</strong>: Indexing your Facebook network. This will take a few minutes...</p>
                <p>While you're waiting, please fill out the survey to the right.</p>
            </div>;
        } else if (this.props.session.indexedSuccessfully && this.props.session.loadingGraph) {
            containerContents = <div>
                <div className="progress">
                    <div className="progress-bar progress-bar-striped active" style={{width: "75%"}}></div>
                </div>
                <p><strong>Step 2 of 2</strong>: Loading visualization. This will take 30 seconds...</p>
                <p>While you're waiting, please fill out the survey to the right.</p>
            </div>;
        } else if (this.props.session.graphLoadedSuccessfully) {
            containerContents = <div>
                <div className="progress">
                    <div className="progress-bar progress-bar-success progress-bar-striped" style={{width: "100%"}}></div>
                </div>
                <p className="lead">Thank you so much for allowing me to use your data for science!</p>
                <p>As a reward for helping me, scroll down to see a nifty visualization of the Ice Bucket Challenge propogating through your Facebook network.</p>
            </div>;
        } else {
            containerContents = <div>
                <div className="progress">
                    <div className="progress-bar progress-bar-danger progress-bar-striped" style={{width: "100%"}}></div>
                </div>
                <p>whoops! There was an error while indexing. Please try again by refreshing the page.</p>
            </div>;
        }
        
        return containerContents;
    }
});
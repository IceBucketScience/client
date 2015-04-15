var React = require("react");

module.exports = React.createClass({
    render: function() {
        return <div className="row">
            <div className="col-sm-12">
                <div className="page-header">
                    <h3><small>{this.props.stepNumber}.</small> {this.props.stepDescription}</h3>
                </div>
                <div className="panel panel-default">
                    <div className="panel-body">{this.props.children}</div>
                </div>
            </div>
        </div>;
    }
});
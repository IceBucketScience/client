var React = require("react");

module.exports = React.createClass({
    render: function() {
        var classes = "col-sm-" + this.props.size;
        if (this.props.offset) {
            classes += " col-sm-offset-" + this.props.offset;
        }

        return <div className={classes}>
            <div className="page-header">
                <h3 className="text-center">{this.props.description}</h3>
            </div>
            <div className="panel panel-default">
                <div className="panel-body">{this.props.children}</div>
            </div>
        </div>;
    }
});
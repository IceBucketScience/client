var React = require("react");

module.exports = React.createClass({
    handleChange: function(e) {
        this.props.onChange(e.target.value);
    },
    render: function() {
        var formGroupClasses = "form-group"
        if (this.props.value === "") {
            formGroupClasses += " has-error";
        }
        return <div className={formGroupClasses}>
            {this.props.children}
            <div className="row">
                <div className="col-xs-8"> 
                    <input type="text" className="form-control" id={this.props.name} value={this.props.value} onChange={this.handleChange} />
                </div>
            </div>
        </div>;
    }
});
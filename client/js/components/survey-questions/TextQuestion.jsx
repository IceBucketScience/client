var React = require("react");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            value: null
        };
    },
    handleChange: function(e) {
        this.setState({value: e.target.value});
        
        this.props.onChange(e.target.value);
    },
    render: function() {
        return <div>
            <label htmlFor={this.props.name}>{this.props.children}</label>
            <input type="text" id={this.props.name} value={this.state.value} onChange={this.handleChange} />
        </div>;
    }
});
var React = require("react");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            value: null
        };
    },
    handleChange: function(e) {
        this.setState({value: e.target.value});
        
        this.props.onChange(e.target.value === "YES");
    },
    render: function() {
        return <div>
            {this.props.children}
            <div>
                <label>
                <input type="radio" name={this.props.name} value="YES" onChange={this.handleChange}/>
                Yes
                </label>
            </div>
            <div>
                <label>
                <input type="radio" name={this.props.name} value="NO" onChange={this.handleChange}/>
                No
                </label>
            </div>
        </div>;
    }
});
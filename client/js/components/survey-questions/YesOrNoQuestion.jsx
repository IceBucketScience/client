var React = require("react");

module.exports = React.createClass({
    handleChange: function(e) {
        this.props.onChange(e.target.value === "YES");
    },
    render: function() {
        var isYes = this.props.isYes;

        return <div>
            {this.props.children}
            <div className="radio">
                <label>
                <input 
                    type="radio" 
                    name={this.props.name} 
                    value="YES" 
                    onChange={this.handleChange} 
                    checked={isYes} />
                Yes
                </label>
            </div>
            <div className="radio">
                <label>
                <input 
                    type="radio" 
                    name={this.props.name} 
                    value="NO" 
                    onChange={this.handleChange}
                    checked={isYes != null && !isYes} />
                No
                </label>
            </div>
        </div>;
    }
});
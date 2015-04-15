var React = require("react");

var moment = require("moment");
var DatePicker = require("react-datepicker");

module.exports = React.createClass({
    handleChange: function(newDate) {
        this.props.onChange(newDate.unix());
    },
    render: function() {
        var dateFormat = "MM/DD/YYYY";

        return <div className="form-group">
            {this.props.children}
            <DatePicker 
                dateFormat={dateFormat}
                minDate={moment.unix(this.props.minDate)}
                maxDate={moment.unix(this.props.maxDate)}
                onChange={this.handleChange} 
                selected={moment.unix(this.props.currDate)} />
        </div>;
    }
});
var React = require("react");

var moment = require("moment");
var DatePicker = require("react-datepicker");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            selectedDate: moment.unix(this.props.minDate)
        };
    },
    handleChange: function(newDate) {
        this.setState({
            selectedDate: newDate
        });

        this.props.onChange(newDate.unix());
    },
    render: function() {
        var dateFormat = "MM/DD/YYYY";

        return <div>
            <label>{this.props.children}</label>
            <DatePicker 
                dateFormat={dateFormat}
                minDate={moment.unix(this.props.minDate)}
                maxDate={moment.unix(this.props.maxDate)}
                onChange={this.handleChange} 
                selected={this.state.selectedDate} />
        </div>;
    }
});
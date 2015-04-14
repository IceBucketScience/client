var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var DatePicker = require("react-datepicker");

module.exports = React.createClass({
    render: function() {
        return <DatePicker />
    }
});
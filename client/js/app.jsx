var React = require("react");

var App = React.createClass({
    render: function() {
        console.log(this.props.test);
        return <h1>{this.props.test}</h1>;
    }
});

React.render(<App test="Hello World" />, document.getElementById("app"));
var Fluxxor = require("fluxxor");
var React = require("react");
var Fb = require("fb");

Fb.init({
    appId: "155173904571953",
    status: true,
    cookie: true,
    xfbml: true
});

var sessionStore = require("./stores/sessionStore");

var App = React.createClass({
    render: function() {
        console.log(this.props.test);
        return <h1>{this.props.test}</h1>;
    }
});

React.render(<App test="Hello World" />, document.getElementById("app"));
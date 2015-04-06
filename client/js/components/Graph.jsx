var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Sigma = require("sigma");

module.exports = React.createClass({
    mixins: [FluxMixin],
    componentDidMount: function() {
        console.log(document.getElementById("graph-container"));
        this.sigmaGraph = new Sigma();
        this.sigmaGraph.addRenderer({
            container: document.getElementById("graph-container")
        });
        this.sigmaGraph.graph.addNode({
            // Main attributes:
            id: 'n0',
            label: 'Hello',
            // Display attributes:
            x: 0,
            y: 0,
            size: 1,
            color: '#BBB'
        }).addNode({
            // Main attributes:
            id: 'n1',
            label: 'World !',
            // Display attributes:
            x: 1,
            y: 1,
            size: 1,
            color: '#BBB'
        }).addEdge({
            id: 'e0',
            // Reference extremities:
            source: 'n0',
            target: 'n1'
        });

        this.sigmaGraph.refresh();
        console.log(this.sigmaGraph.renderers);
    },
    render: function() {
        var graphContainerStyle = {
            width: 200,
            height: 200
        };

        return <div>
            <div id="graph-container" style={graphContainerStyle}></div>
            <p>Graph with {this.props.graph.nodes.length} nodes and {this.props.graph.edges.length} edges</p>
        </div>;
    }
});
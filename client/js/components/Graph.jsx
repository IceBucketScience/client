var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Sigma = /*require("sigma")*/ sigma;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = React.createClass({
    mixins: [FluxMixin],
    getInitialState: function() {
        return {
            sigmaGraph: null,
            initialRenderComplete: false
        };
    },
    componentDidMount: function() {
        this.setState({
            sigmaGraph: new Sigma({
                container: document.getElementById("graph-container"),
                settings: {
                    drawLabels: false,
                    drawEdgeLabels: false,
                    defaultEdgeColor: "#aaa",
                    edgeColor: "default"
                }
            })
        });
    },
    componentWillUnmount: function() {
        //TODO: cleanup sigma instance
    },
    initialRenderGraph: function(graph) {
        this.props.graph.nodes.forEach(function(node) {
            node.x = Math.random();
            node.y = Math.random();
            node.size = 1;
            node.color = "#000";
        });

        graph.graph.read({
            nodes: this.props.graph.nodes,
            edges: this.props.graph.edges
        });
        
        graph.startForceAtlas2({
            startingIterations: 100000000,
            iterationsPerRender: 100
        });

        graph.refresh();

        setTimeout(function() {
            graph.killForceAtlas2();
            this.setState({initialRenderComplete: true});

            setInterval(function() {
                var nodeId = getRandomInt(0, graph.graph.nodes().length);

                graph.graph.nodes()[nodeId].color = "#f00";

                graph.refresh();
            }, 1000);
        }.bind(this), 5000);
    },
    componentDidUpdate: function(prevProps, prevState) {
        if (!this.state.initialRenderComplete &&
            this.props.graph.nodes.length > 0 &&
            this.props.graph.nodes.length > 0) {
            this.initialRenderGraph(this.state.sigmaGraph);
        }
    },
    render: function() {
        var graphContainerStyle = {
            width: "100%",
            height: 500,
            border: 1,
            borderStyle: "solid",
            borderColor: "#000"
        };

        return <div>
            <div id="graph-container" style={graphContainerStyle}></div>
        </div>;
    }
});
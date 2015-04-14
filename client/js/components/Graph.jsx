var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Sigma = /*require("sigma")*/ sigma;

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
                    labelThreshold: 9001,
                    singleHover: true,
                    drawEdgeLabels: false,
                    defaultNodeColor: "#000",
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
        graph.graph.read({
            nodes: this.props.graph.nodes.map(function(node, index) {
                node.label = node.name;

                node.x = Math.random();
                node.y = Math.random();
                node.size = 1;

                if (index === 0) {
                    node.size = 2;
                    node.color = "#e00";
                }

                return node;
            }),
            edges: this.props.graph.edges
        });
        
        graph.startForceAtlas2({
            /*startingIterations: 1,
            iterationsPerRender: 1*/
        });

        setTimeout(function() {
            graph.killForceAtlas2();
            this.setState({initialRenderComplete: true});
        }.bind(this), 5000);
    },
    componentDidUpdate: function(prevProps, prevState) {
        var self = this;
        var graph = self.state.sigmaGraph;

        if (!self.state.initialRenderComplete &&
            self.props.graph.nodes.length > 0 &&
            self.props.graph.nodes.length > 0) {
            self.initialRenderGraph(graph);
        }
        
        if (self.state.initialRenderComplete) {
            self.props.graph.currNominated.forEach(function(id) {
                graph.graph.nodes(id).color = "#a00";
            });

            self.props.graph.currCompleted.forEach(function(id) {
                graph.graph.nodes(id).color = "#00a";
            });

            self.props.graph.activeNominations.forEach(function(id) {
                graph.graph.edges(id).color = "#46c4ff";
            });
        }

        this.state.sigmaGraph.refresh();
    },
    render: function() {
        var graphContainerStyle = {
            width: "100%",
            height: 500,
            border: 1,
            borderStyle: "solid",
            borderColor: "#000"
        };

        return <div id="graph-container" style={graphContainerStyle}></div>;
    }
});
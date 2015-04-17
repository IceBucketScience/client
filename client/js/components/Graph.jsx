var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Sigma = /*require("sigma")*/ sigma;

module.exports = React.createClass({
    mixins: [FluxMixin],
    getInitialState: function() {
        return {
            sigmaGraph: null,
            initialRenderComplete: false,
            defaultNodeColor: "#858585",
            defaultEdgeColor: "#ddd",
            nominatedNodeColor: "#f0ad4e",
            completedNodeColor: "#5bc0de",
            nominationEdgeColor: "#337ab7" 
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
                    defaultNodeColor: this.state.defaultNodeColor,
                    defaultEdgeColor: this.state.defaultEdgeColor,
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
        } else if (self.state.initialRenderComplete && self.props.graph.inInitialState) {
            graph.graph.nodes().forEach(function(node) {
                node.color = self.state.defaultNodeColor;
            });

            graph.graph.edges().forEach(function(edge) {
                edge.color = self.state.defaultEdgeColor;
            });
        } else if (self.state.initialRenderComplete) {
            self.props.graph.currNominated.forEach(function(id) {
                graph.graph.nodes(id).color = self.state.nominatedNodeColor;
            });

            self.props.graph.currCompleted.forEach(function(id) {
                graph.graph.nodes(id).color = self.state.completedNodeColor;
            });

            self.props.graph.activeNominations.forEach(function(id) {
                graph.graph.edges(id).color = self.state.nominationEdgeColor;
            });
        }

        this.state.sigmaGraph.refresh();
    },
    render: function() {
        var graphContainerStyle = {
            width: "100%",
            height: 500,
            border: "1px solid #ddd",
            borderRadius: 4
        };

        return <div id="graph-container" style={graphContainerStyle}></div>;
    }
});
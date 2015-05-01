var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var SurveyStore = require("./stores/SurveyStore");

var stores = {
    SurveyStore: new SurveyStore()
};

var SurveyActions = require("./actions/SurveyActions");

var actions = {
    survey: SurveyActions
};

var Block = require("./components/Block.jsx");
var Survey = require("./components/Survey.jsx");

var App = React.createClass({
    mixins: [FluxMixin],
    render: function() {
        return <div className="container">
                <div className="row">
                    <div className="col-sm-10 col-sm-offset-1">
                        <h1 className="text-center">How do social connections affect our philanthropic behavior?</h1>
                        <div className="row" style={{marginTop: 24}}>
                            <div className="col-sm-3">
                                <img className="img-responsive img-circle" src="/static/assets/brad_photo.jpg" style={{width: "100%", marginLeft: "auto", marginRight: "auto"}}/>
                            </div>
                            <div className="col-sm-9">
                                <h4 className="lead">I'm Brad Ross, and for my high school senior thesis project, I want to explore this topic by studying the <a href="http://www.alsa.org/fight-als/ice-bucket-challenge.html">#ALSIceBucketChallenge</a>. To do so, <strong>I need you to answer the questions below.</strong> I promise I will not make your data public, and I will permanently delete your responses after I'm done with my project. If you're interested in seeing the results, shoot me an email at brad.ross.35@gmail.com. Thanks in advance!</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <Block
                        size="10"
                        offset="1"
                        description="Fill Out This Short Survey">
                        <Survey />
                    </Block>
                </div>
            </div>;
    }
});

var flux = new Fluxxor.Flux(stores, actions);

React.render(<App flux={flux} />, document.getElementById("app"));
var Fluxxor = require("fluxxor");

var constants = require("../constants");

module.exports = Fluxxor.createStore({
    initialize: function() {
        console.log(constants);

        this.bindActions(

        );
    },
    getState: function() {

    }
});
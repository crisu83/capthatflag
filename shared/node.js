'use strict';

var utils = require('./utils');

// base node class
var Node = utils.inherit(null, {
    key: 'node'
    , eventHandlers: null
    // constructor
    , constructor: function() {
        this.eventHandlers = {};
    }
    // adds an event listener to this node
    , on: function(event, handler) {
        this.eventHandlers[event] = this.eventHandlers[event] || [];
        this.eventHandlers[event].push(handler);
    }
    // triggers an event for this node
    , trigger: function(event, params) {
        if (this.eventHandlers[event]) {
            for (var i = 0; i < this.eventHandlers[event].length; i++) {
                this.eventHandlers[event][i].apply(this, params);
            }
        }
    }
});

module.exports = Node;

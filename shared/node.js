'use strict';

var utils = require('./utils')
    , Node;

/**
 * Node class.
 * @class shared.Node
 */
Node = utils.inherit(null, {
    /**
     * Identifier for this node.
     * @type {string}
     */
    key: 'node'
    /**
     * Internal event handlers for this node.
     * @type {object}
     */
    , eventHandlers: null
    /**
     * Creates a new node.
     * @constructor
     */
    , constructor: function() {
        this.eventHandlers = {};
    }
    /**
     * Adds an event handler to this node.
     * @type {string} event event type
     * @type {function} handler event handler
     */
    , on: function(event, handler) {
        this.eventHandlers[event] = this.eventHandlers[event] || [];
        this.eventHandlers[event].push(handler);
    }
    /**
     * Triggers an event for this node.
     * @type {string} event event type
     * @type {array} params parameters to pass to the handlers
     */
    , trigger: function(event, params) {
        if (this.eventHandlers[event]) {
            for (var i = 0; i < this.eventHandlers[event].length; i++) {
                this.eventHandlers[event][i].apply(this, params);
            }
        }
    }
});

module.exports = Node;

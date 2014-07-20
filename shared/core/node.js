'use strict';

var utils = require('../utils')
    , Node;

/**
 * Node class.
 * @class shared.Node
 * @classdesc Node base class.
 * @property {string} key - Node identifier.
 * @property {object} _eventHandlers - Internal event handlers for the node.
 */
Node = utils.inherit(null, {
    key: 'node'
    , _eventHandlers: null
    /**
     * Creates a new node.
     * @constructor
     */
    , constructor: function() {
        this._eventHandlers = {};
    }
    /**
     * Adds an event handler to this node.
     * @method shared.Node#on
     * @param {string} event - Event type.
     * @param {function} handler - Event handler.
     */
    , on: function(event, handler) {
        this._eventHandlers[event] = this._eventHandlers[event] || [];
        this._eventHandlers[event].push(handler);
    }
    /**
     * Triggers an event for this node.
     * @method shared.Node#trigger
     * @param {string} event - Event type.
     * @param {array} params - Parameters to call the handlers with.
     */
    , trigger: function(event, params) {
        if (this._eventHandlers[event]) {
            for (var i = 0; i < this._eventHandlers[event].length; i++) {
                this._eventHandlers[event][i].apply(this, params);
            }
        }
    }
});

module.exports = Node;

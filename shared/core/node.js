'use strict';

var utils = require('../utils')
    , Node;

/**
 * Node class.
 * @class shared.core.Node
 * @classdesc Node base class.
 */
Node = utils.inherit(null, {
    /**
     * Creates a new node.
     * @constructor
     */
    constructor: function() {
        /**
         * @property {string} key - Node identifier.
         */
        this.key = 'node';

        // internal properties
        this._eventHandlers = {};
    }
    /**
     * Adds an event handler to this node.
     * @method shared.core.Node#on
     * @param {string} event - Event type.
     * @param {function} handler - Event handler.
     */
    , on: function(event, handler) {
        this._eventHandlers[event] = this._eventHandlers[event] || [];
        this._eventHandlers[event].push(handler);
    }
    /**
     * Triggers an event for this node.
     * @method shared.core.Node#trigger
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

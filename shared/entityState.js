'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , EntityState;

/**
 * Entity state class.
 * @class shared.EntityState
 */
EntityState = utils.inherit(null, {
    /**
     * State item queue.
     * @type {array}
     */
    queue: null
    /**
     * Currently active state.
     * @type {object}
     */
    , current: null
    /**
     * Creates a new entity state queue.
     * @constructor
     */
    , constructor: function() {
        this.queue = [];
    }
    /**
     * Adds variables to the current state.
     * @param {object} vars variables to add to the state
     */
    , add: function(vars) {
        this.current = _.extend(this.current || {}, vars);
    }
    /**
     * Discards all items older than or equal the given timestamp.
     * @param {number} timestamp unix timestamp of the oldest item to discard
     */
    , discardAt: function(timestamp) {
        this.queue = _.filter(this.queue, function(item) {
            return item.timestamp > timestamp;
        })
    }
    /**
     * Pushes a state to the queue.
     * @param {object} state state to push to the queue
     * @return {object} pushed state
     */
    , push: function(state) {
        state.timestamp = state.timestamp || +new Date();
        this.queue.push(state);
        return state;
    }
    /**
     * Takes the next state from the queue, sets it as the current state and returns it.
     * @return {object} current state
     */
    , next: function() {
        if (this.queue.length) {
            this.current = this.queue.shift();
        }
        return this.current;
    }
    /**
     * Resets the current state.
     */
    , reset: function() {
        this.current = null;
    }
     /**
      * Returns whether this state has changed.
      * @return {boolean} the result
      */
    , hasChanged: function() {
        return this.current !== null;
    }
});

module.exports = EntityState;

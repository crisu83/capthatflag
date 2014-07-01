'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , EntityState;

/**
 * Entity state class.
 * @class shared.EntityState
 * @classdesc Utility class for managing entity states.
 * @property {object} current - Currently active state.
 * @property {array} _queue - State item queue.
 */
EntityState = utils.inherit(null, {
    current: null
    , _queue: null
    /**
     * Creates a new entity state queue.
     * @constructor
     */
    , constructor: function() {
        this._queue = [];
    }
    /**
     * Adds variables to the current state.
     * @method shared.EntityState#add
     * @param {object} vars - Variables to add to the state.
     */
    , add: function(vars) {
        this.current = _.extend(this.current || {}, vars);
    }
    /**
     * Discards all items older than or equal the given timestamp.
     * @method shared.EntityState#discardAt
     * @param {number} timestamp - Timestamp of the latest item to discard.
     */
    , discardAt: function(timestamp) {
        this._queue = _.filter(this._queue, function(item) {
            return item.timestamp > timestamp;
        });
    }
    /**
     * Pushes a state to the queue.
     * @method shared.EntityState#push
     * @param {object} state - State to push to the queue.
     * @return {object} Pushed state.
     */
    , push: function(state) {
        state.timestamp = state.timestamp || +new Date();
        this._queue.push(state);
        return state;
    }
    /**
     * Takes the next state from the queue, sets it as the current state and returns it.
     * @method shared.EntityState#next
     * @return {object} Current state.
     */
    , next: function() {
        if (this._queue.length) {
            this.current = this.queue.shift();
        }
        return this.current;
    }
    /**
     * Resets the current state.
     * @method shared.EntityState#reset
     */
    , reset: function() {
        this.current = null;
    }
     /**
      * Returns whether this state has changed.
      * @method shared.EntityState#hasChanged
      * @return {boolean} The result.
      */
    , hasChanged: function() {
        return this.current !== null;
    }
});

module.exports = EntityState;

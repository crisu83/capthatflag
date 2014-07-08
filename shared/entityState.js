'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , EntityState;

/**
 * Entity state class.
 * @class shared.EntityState
 * @classdesc Utility class for managing entity states.
 * @property {object} _current - Index of the current state snapshot.
 * @property {array} _snapshots - Intenal state snapshots.
 */
EntityState = utils.inherit(null, {
    _current: -1
    , _snapshots: null
    /**
     * Creates a new entity state queue.
     * @constructor
     */
    , constructor: function() {
        this._snapshots = [];
    }
    /**
     * Timestamps and saves a snapshot of the given state.
     * @method shared.EntityState#snapshot
     * @param {object} state - State to snapshot.
     */
    , snapshot: function(state) {
        state.timestamp = +new Date();
        this._snapshots.push(state);
    }
    /**
     * TODO
     */
    , next: function() {
        if (this._current < this._snapshots.length - 2) {
            this._current++;
        }
    }
    /**
     * Returns the number of states in the queue.
     * @method shared.EntityState#size
     * @return {number} Queue length.
     */
    , size: function() {
        return this._snapshots.length;
    }
    /**
     * TODO
     */
    , isEmpty: function() {
        return this.size() === 0;
    }
    /**
     * Returns a snapshot of the current state.
     * @method shared.EntityState#getCurrent
     * @return {object} State snapshot.
     */
    , getCurrent: function() {
        var state = this.get(this._current);
        this.next();
        return state;
    }
    /**
     * Returns a snapshot of the next state.
     * @method shared.EntityState#getNext
     * @return {object} State snapshot.
     */
    , getNext: function() {
        return this.get(this._current + 1);
    }
    /**
     * Returns an approximation of the current state using linear interpolation.
     * @method shared.EntityState#interpolate
     * @return {object} State snapshot.
     */
    , interpolate: function() {
        // TODO consider making the delay configurable (currently hard-coded at 100).
        var delayTick = +new Date() - 100
            , state = this.getCurrent()
            , next = this.getNext();

        if (state && next) {
            var factor = (delayTick - state.timestamp) / (next.timestamp - state.timestamp);

            // make sure that the interpolation factor is between 0 and 1.
            if (factor < 0) {
                factor = 0;
            } else if (factor > 1) {
                factor = 1;
            }

            for (var name in next) {
                if (next.hasOwnProperty(name) && state[name]) {
                    state[name] = utils.lerp(state[name], next[name], factor);
                }
            }

            return state;
        }

        return null;
    }
    /**
     * Returns a specific state snapshot.
     * @method shared.EntityState#get
     * @param {number} index - Snapshot index.
     * @return {object} State snapshot.
     */
    , get: function(index) {
        return this._snapshots[index] ? this._snapshots[index] : null;
    }
});

module.exports = EntityState;

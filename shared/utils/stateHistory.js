'use strict';

var utils = require('../utils')
    , ListBase = require('./list')
    , StateHistory;

/**
 * State history class.
 * @class shared.utils.StateHistory
 * @classdesc Utility class for tracking snapshots of the game state.
 * @extends shared.utils.List
 */
StateHistory = utils.inherit(ListBase, {
    /**
     * Create a new state history.
     * @constructor
     * @param {number} expireMsec - Time for the snapshots to expire (in msec).
     */
    constructor: function(expireMsec) {
        ListBase.apply(this);

        // internal properties
        this._expireMsec = expireMsec;
    }
    /**
     * Creates a new snapshot of the game state.
     * @method shared.utils.StateHistory#snapshot
     * @param {object} entityMap - Map of serialized entities.
     */
    , snapshot: function(state) {
        this.add(state);
        this.removeExpired(+new Date() - this._expireMsec);
    }
    /**
     * Removes expired snapshots from the history.
     * @method shared.utils.StateHistory#removeExpired
     * @param {number} expireTime - Timestamp for snapshot expiration.
     */
    , removeExpired: function(expireTime) {
        this.filter(function(item) { return item.timestamp > expireTime; }, true);
    }
    /**
     * Returns the state snapshot previous to the current one.
     * @method shared.utils.StateHistory#previous
     * @return {object} World state.
     */
    , previous: function() {
        return this.get(this.size() - 2);
    }
});

module.exports = StateHistory;

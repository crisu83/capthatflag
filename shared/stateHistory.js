'use strict';

var utils = require('./utils')
    , ListBase = require('./list')
    , StateHistory;

/**
 * State history class.
 * @class shared.StateHistory
 * @classdesc Utility class for tracking snapshots of the game state.
 * @extends shared.List
 */
StateHistory = utils.inherit(ListBase, {
    _expireMsec: null
    /**
     * Create a new state history.
     * @constructor
     * @param {number} expireMsec - Time for the snapshots to expire (in msec).
     */
    , constructor: function(expireMsec) {
        ListBase.apply(this);

        this._expireMsec = expireMsec;
    }
    /**
     * Creates a new snapshot of the game state.
     * @method shared.StateHistory#snapshot
     * @param {array} entities - List of serialized entities.
     */
    , snapshot: function(entities) {
        var now = +new Date();
        this.add({timestamp: now, entities: entities});
        this.removeExpired(now - this._expireMsec);
    }
    /**
     * Removes expired snapshots from the history.
     * @method shared.StateHistory#removeExpired
     * @param {number} expireTime - Timestamp for snapshot expiration.
     */
    , removeExpired: function(expireTime) {
        this.filter(function(item) { return item.timestamp > expireTime; });
    }
});

module.exports = StateHistory;

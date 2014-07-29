'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ListBase = require('../../../shared/utils/list')
    , SnapshotHistory;

/**
 * Snapshot history class.
 * @class shared.utils.SnapshotHistory
 * @classdesc Utility class for managing snapshots of the game state.
 * @extends shared.utils.List
 */
SnapshotHistory = utils.inherit(ListBase, {
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
     * @override
     */
    , add: function(item) {
        var now = _.now();
        item.receivedAt = now;
        ListBase.prototype.add.apply(this, arguments);
        this.removeExpired(now - this._expireMsec);
    }
    /**
     * Removes expired snapshots from the history.
     * @method shared.utils.SnapshotHistory#removeExpired
     * @param {number} expireTime - Timestamp for snapshot expiration.
     */
    , removeExpired: function(expireTime) {
        this.filter(function(item) { return item.receivedAt > expireTime; }, true);
    }
    /**
     * Returns the snapshot previous to the latest one.
     * @method shared.utils.SnapshotHistory#previous
     * @return {object} Snapshot object.
     */
    , previous: function() {
        return this.get(this.size() - 2);
    }
});

module.exports = SnapshotHistory;

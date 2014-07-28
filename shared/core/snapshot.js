'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , Snapshot;

/**
 * TODO
 */
Snapshot = utils.inherit(null, {
    /**
     * TODO
     */
    constructor: function() {
        this.sequence = null;
        this.entities = [];
        this.flags = [];
        this.teams = {};
        this.playerCount = null;
        this.flagCount = null;
        this.createdAt = _.now();
        this.receivedAt = null;
        this.gameTimeElapsed = null;
    }
    /**
     * TODO
     */
    , serialize: function() {
        return {
            sequence: this.sequence
            , entities: this.entities
            , flags: this.flags
            , teams: this.teams
            , playerCount: this.playerCount
            , flagCount: this.flagCount
            , createdAt: this.createdAt
            , gameTimeElapsed: this.gameTimeElapsed
        };
    }
    /**
     * TODO
     */
    , set: function(data) {
        _.forOwn(data, function(value, key) {
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        }, this);
    }
});

module.exports = Snapshot;

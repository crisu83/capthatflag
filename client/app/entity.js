'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
    , EntityBase = require('../../shared/entity')
    , Entity;

/**
 * Client entity class.
 * @class client.Entity
 * @classdesc Entity class for the client.
 * @extends shared.Entity
 */
Entity = utils.inherit(EntityBase, {
    /**
     * Synchronizes the state of the this entity.
     * @method client.Entity#sync
     * @param {object} state - Entity state.
     */
    sync: function(state) {
        this.state.snapshot(state);
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        EntityBase.prototype.update.apply(this, arguments);

        var state = this.state.interpolate();
        if (state) {
            this.trigger('entity.sync', [state]);
        }
    }
});

module.exports = Entity;

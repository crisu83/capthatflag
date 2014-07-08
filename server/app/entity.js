'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
    , EntityBase = require('../../shared/entity')
    , EntityState = require('../../shared/entityState')
    , config = require('./config.json')
    , Entity;

/**
 * Server entity class.
 * @class server.Entity
 * @classdesc Entity class for the server.
 * @extends shared.Entity
 */
Entity = utils.inherit(EntityBase, {
    /**
     * @override
     */
    update: function(elapsed) {
        EntityBase.prototype.update.apply(this, arguments);

        this.state.snapshot(this.attrs.get());
    }
});

module.exports = Entity;

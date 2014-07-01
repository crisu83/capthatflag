'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , HashmapBase = require('./hashmap')
    , EntityHashmap;

/**
 * Entity hashmap class.
 * @class shared.EntityHashmap
 * @extends shared.Hashmap
 */
EntityHashmap = utils.inherit(HashmapBase, {
    /**
     * @inheritdoc
     */
    update: function(elapsed) {
        for (var id in this.items) {
            if (this.items.hasOwnProperty(id)) {
                this.items[id].update(elapsed);
            }
        }
    }
    /**
     * @inheritdoc
     */
    , add: function(key, value) {
        value.on('entity.die', this.onEntityDeath.bind(this));
        HashmapBase.prototype.add.apply(this, arguments);
    }
    /**
     * Event handler for when an entity dies.
     * @param {shared.Entity} entity entity instance
     */
    , onEntityDeath: function(entity) {
        this.remove(entity.attrs.get('id'));
    }
});

module.exports = EntityHashmap;

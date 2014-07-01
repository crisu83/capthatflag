'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , HashmapBase = require('./hashmap')
    , EntityHashmap;

/**
 * Entity hashmap class.
 * @class shared.EntityHashmap
 * @classmap Utility class for managing a large number of entities.
 * @extends shared.Hashmap
 */
EntityHashmap = utils.inherit(HashmapBase, {
    /**
     * @override
     */
    update: function(elapsed) {
        for (var id in this.items) {
            if (this.items.hasOwnProperty(id)) {
                this.items[id].update(elapsed);
            }
        }
    }
    /**
     * @override
     */
    , add: function(key, value) {
        value.on('entity.die', this.onEntityDeath.bind(this));
        HashmapBase.prototype.add.apply(this, arguments);
    }
    /**
     * Event handler for when an entity dies.
     * @method shared.EntityHashmap#onEntityDeath
     * @param {shared.Entity} entity - Entity instance.
     */
    , onEntityDeath: function(entity) {
        this.remove(entity.attrs.get('id'));
    }
});

module.exports = EntityHashmap;

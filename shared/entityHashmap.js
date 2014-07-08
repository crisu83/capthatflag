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
        for (var id in this._items) {
            if (this._items.hasOwnProperty(id)) {
                this._items[id].update(elapsed);
            }
        }
    }
    /**
     * @override
     */
    , add: function(key, value) {
        HashmapBase.prototype.add.apply(this, arguments);
        value.on('entity.die', this.onEntityDeath.bind(this));
    }
    /**
     * Event handler for when an entity dies.
     * @method shared.EntityHashmap#onEntityDeath
     * @param {number} entityId - Entity identifier.
     */
    , onEntityDeath: function(entityId) {
        this.remove(entityId);
    }
});

module.exports = EntityHashmap;

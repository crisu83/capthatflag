'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , HashmapBase = require('./hashmap')
    , EntityHashmap;

/**
 * Entity hashmap class.
 * @class shared.utils.EntityHashmap
 * @classmap Utility class for managing a large number of entities.
 * @extends shared.utils.Hashmap
 */
EntityHashmap = utils.inherit(HashmapBase, {
    /**
     * @override
     */
    add: function(key, value) {
        HashmapBase.prototype.add.apply(this, arguments);
        value.on('entity.remove', this.onEntityRemove.bind(this));
    }
    /**
     * Event handler for when an entity is removed.
     * @method shared.utils.EntityHashmap#onEntityRemove
     * @param {shared.core.Entity} entity - Entity instance.
     */
    , onEntityRemove: function(entity) {
        this.remove(entity.id);
    }
    /**
     * Kills all single in the hashmap.
     * @method shared.utils.EntityHashmap#kill
     */
    , kill: function(id) {
        var entity = this.get(id);
        if (entity) {
            entity.die();
        }
    }
});

module.exports = EntityHashmap;

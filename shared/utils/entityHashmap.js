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
        value.on('entity.die', this.onEntityDeath.bind(this));
    }
    /**
     * Event handler for when an entity dies.
     * @method shared.utils.EntityHashmap#onEntityDeath
     * @param {number} id - Entity identifier.
     */
    , onEntityDeath: function(id) {
        this.remove(id);
    }
});

module.exports = EntityHashmap;

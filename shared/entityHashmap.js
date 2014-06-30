'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , HashmapBase = require('./hashmap');

var EntityHashmap = utils.inherit(HashmapBase, {
    // updates all the entities in this hashmap
    update: function(elapsed) {
        for (var id in this.items) {
            if (this.items.hasOwnProperty(id)) {
                this.items[id].update(elapsed);
            }
        }
    }
    // adds an item to this hashmap
    , add: function(key, value) {
        value.on('entity.die', this.onEntityDeath.bind(this));
        HashmapBase.prototype.add.apply(this, arguments);
    }
    // event handler for when an entity dies
    , onEntityDeath: function(entity) {
        this.remove(entity.attrs.get('id'));
    }
});

module.exports = EntityHashmap;

'use strict';

var utils = require('../../shared/utils')
    , HashmapBase = require('../../shared/hashmap');

// client hashmap class
var ClientHashmap = utils.inherit(HashmapBase, {
    // synchronizes all the clients in this hashmap
    sync: function(state) {
        for (var id in this.items) {
            if (this.items.hasOwnProperty(id)) {
                this.items[id].sync(state);
            }
        }
    }
    /*
    // adds an item to this collection
    , add: function(key, value) {
        value.on('client.disconnect', this.onClientDisconnect.bind(this));
        HashmapBase.prototype.add.apply(this, arguments);
    }
    // event handler for when a client disconnects
    , onClientDisconnect: function(client) {
        this.remove(client.id);
    }
    */
});

module.exports = ClientHashmap;

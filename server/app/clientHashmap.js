'use strict';

var utils = require('../../shared/utils')
    , HashmapBase = require('../../shared/hashmap')
    , ClientHashmap;

/**
 * Client hashmap class.
 * @class server.ClientHashmap
 * @extends shared.Hashmap
 */
ClientHashmap = utils.inherit(HashmapBase, {
    /**
     * Synchronizes all the clients in this hashmap.
     * @param {object} state state to synchronize
     */
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

'use strict';

var utils = require('../../shared/utils')
    , HashmapBase = require('../../shared/hashmap')
    , ClientHashmap;

/**
 * Client hashmap class.
 * @class server.ClientHashmap
 * @classdesc Utility class for managing multiple client connections.
 * @extends shared.Hashmap
 */
ClientHashmap = utils.inherit(HashmapBase, {
    /**
     * Synchronizes all the clients in this hashmap.
     * @method server.ClientHashmap#sync
     * @param {object} state state to synchronize
     */
    sync: function(state) {
        for (var id in this._items) {
            if (this._items.hasOwnProperty(id)) {
                this._items[id].sync(state);
            }
        }
    }
    /**
     * @override
     */
    , add: function(key, value) {
        HashmapBase.prototype.add.apply(this, arguments);
        value.on('client.disconnect', this.onClientDisconnect.bind(this));
    }
    /**
     * Event hanlder for when the client disconnects.
     * @method server.ClientHashmap#onClientDisconnect
     * @param {string} clientId - Client identifier.
     */
    , onClientDisconnect: function(clientId) {
        this.remove(clientId);
    }
});

module.exports = ClientHashmap;

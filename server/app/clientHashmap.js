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
        for (var id in this.items) {
            if (this.items.hasOwnProperty(id)) {
                this.items[id].sync(state);
            }
        }
    }
});

module.exports = ClientHashmap;

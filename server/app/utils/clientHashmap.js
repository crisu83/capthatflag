'use strict';

var utils = require('../../../shared/utils')
    , HashmapBase = require('../../../shared/utils/hashmap')
    , ClientHashmap;

/**
 * Client hashmap class.
 * @class server.utils.ClientHashmap
 * @classdesc Utility class for managing multiple client connections.
 * @extends shared.utils.Hashmap
 */
ClientHashmap = utils.inherit(HashmapBase, {
    /**
     * @override
     */
    add: function(key, value) {
        HashmapBase.prototype.add.apply(this, arguments);
        value.on('client.disconnect', this.onClientDisconnect.bind(this));
    }
    /**
     * Event hanlder for when the client disconnects.
     * @method server.utils.ClientHashmap#onClientDisconnect
     * @param {string} clientId - Client identifier.
     */
    , onClientDisconnect: function(clientId) {
        this.remove(clientId);
    }
});

module.exports = ClientHashmap;

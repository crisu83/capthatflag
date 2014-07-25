'use strict';

var utils = require('../../../shared/utils')
    , ListBase = require('../../../shared/utils/list')
    , ClientList;

/**
 * Client list class.
 * @class server.utils.ClientList
 * @classdesc Utility class for managing multiple client connections.
 * @extends shared.utils.List
 */
ClientList = utils.inherit(ListBase, {
    /**
     * @override
     */
    add: function(value) {
        ListBase.prototype.add.apply(this, arguments);
        value.on('client.disconnect', this.onClientDisconnect.bind(this));
    }
    /**
     * Event hanlder for when the client disconnects.
     * @method server.utils.ClientHashmap#onClientDisconnect
     * @param {server.core.Client} client - Client instance.
     */
    , onClientDisconnect: function(client) {
        this.remove(client);
    }
});

module.exports = ClientList;

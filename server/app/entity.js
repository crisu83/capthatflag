'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../../shared/utils')
    , EntityBase = require('../../shared/entity')
    , Entity;

/**
 * Server entity class.
 * @class server.Entity
 * @classdesc Entity class for the server.
 * @extends shared.Entity
 */
Entity = utils.inherit(EntityBase, {
    /**
     * @override
     */
    constructor: function(socket, data, config) {
        EntityBase.apply(this, arguments);

        // identifiers are always generated on the server (and passed to the client)
        this.id = shortid.generate();
    }
});

module.exports = Entity;

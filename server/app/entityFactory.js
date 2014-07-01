'use strict';

var _ = require('lodash')
    , Entity = require('./entity')
    , EntityFactory;

/**
 * Entity factory static class.
 * @class server.EntityFactory
 */
EntityFactory = {
    /**
     * Creates a new entity.
     * @method server.EntityFactory#create
     * @param {Socket} socket - Socket interface.
     * @param {string} key - Entity type.
     * @return {server.Entity} Entity instance.
     */
    create: function(socket, key) {
        var data = this.loadData(key)
            , entity = new Entity(socket, data);

        // todo: consider including components in the data and attaching them here

        return entity;
    }
    /**
     * Loads data for a specific entity.
     * @method server.EntityFactory#loadData
     * @param {string} key - Entity type.
     * @return {object} Entity data.
     */
    , loadData: function(key) {
        // return a clone so that we get a different reference
        // to the data for each entity
        var data = require('../data/entities/' + key + '.json');
        return _.clone(data);
    }
};

module.exports = EntityFactory;

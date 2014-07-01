'use strict';

var _ = require('lodash')
    , Entity = require('./entity')
    , EntityFactory;

/**
 * Entity factory static class.
 * @type {object}
 */
EntityFactory = {
    /**
     * Creates a new entity.
     * @param {Socket} socket interface
     * @param {string} key entity type
     * @return {server.Entity} entity instance
     */
    create: function(socket, key) {
        var data = this.loadData(key)
            , entity = new Entity(socket, data);

        // todo: consider including components in the data and attaching them here

        return entity;
    }
    /**
     * Loads data for a specific entity.
     * @param {string} key entity type
     * @return {object} entity data
     */
    , loadData: function(key) {
        // return a clone so that we get a different reference
        // to the data for each entity
        var data = require('../data/entities/' + key + '.json');
        return _.clone(data);
    }
};

module.exports = EntityFactory;

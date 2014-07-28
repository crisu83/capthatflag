'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , Entity = require('../../../shared/core/entity')
    , DataManager = require('./dataManager')
    , EntityFactory;

/**
 * Entity factory static class.
 * @class server.core.EntityFactory
 * @classdesc Factory class for creating entities.
 */
EntityFactory = {
    /**
     * Creates a new entity.
     * @method server.core.EntityFactory#create
     * @param {string} key - Entity type.
     * @return {shared.core.Entity} Entity instance.
     */
    create: function(key) {
        var entity = null
            , data = this.loadData(key);

        switch (key) {
            case 'player':
                entity = this.createPlayer(data);
                break;
            case 'flag':
                entity = this.createFlag(data);
                break;
            default:
                break;
        }

        return entity;
    }
    /**
     * Create a new player entity.
     * @method server.core.EntityFactory#createPlayer
     * @return {shared.core.Entity} Entity instance.
     */
    , createPlayer: function(data) {
        var entity = new Entity(data);

        // TODO add components

        return entity;
    }
    /**
     * Create a new flag entity.
     * @method client.core.EntityFactory#createFlag
     * @return {shared.core.Entity} Entity instance.
     */
    , createFlag: function(data) {
        var entity = new Entity(data);

        // TODO add components

        return entity;
    }
    /**
     * Loads data for a specific entity.
     * @method server.core.EntityFactory#loadData
     * @param {string} key - Entity type.
     * @return {object} Entity data.
     */
    , loadData: function(key) {
        var data = DataManager.getEntity(key);

        return {
            id: shortid.generate()
            , key: data.key
            , attrs: _.clone(data.attrs)
        };
    }
};

module.exports = EntityFactory;

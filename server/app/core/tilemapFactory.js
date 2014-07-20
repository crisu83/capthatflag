'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , Tilemap = require('./tilemap')
    , DataManager = require('./dataManager')
    , TilemapFactory;

/**
 * Tilemap factory static class.
 * @class server.TilemapFactory
 * @classdesc Factory class for creating tilemaps.
 */
TilemapFactory = {
    /**
     * Creates a new tilemap.
     * @method server.TilemapFactory#create
     * @param {string} key - Tilemap type.
     * @return {server.Tilemap} Tilemap instance.
     */
    create: function(key) {
        return new Tilemap(this.loadData(key));
    }
    /**
     * Loads data for a specific tilemap.
     * @method server.TilemapFactory#loadData
     * @param {string} key - Tilemap type.
     * @return {object} Tilemap data.
     */
    , loadData: function(key) {
        var data = DataManager.getTilemap(key);
        return _.extend({id: shortid.generate()}, _.omit(data, ['assets']));
    }
};

module.exports = TilemapFactory;

'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , Tilemap = require('./tilemap')
    , DataManager = require('./dataManager')
    , TilemapFactory;

/**
 * TODO
 */
TilemapFactory = {
    /**
     * TODO
     */
    create: function(key) {
        return new Tilemap(this.loadData(key));
    }
    /**
     * TODO
     */
    , loadData: function(key) {
        var data = DataManager.getTilemap(key);
        return _.extend({id: shortid.generate()}, _.omit(data, ['assets']));
    }
};

module.exports = TilemapFactory;

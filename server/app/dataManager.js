'use strict';

var path = require('path')
    , fs = require('fs')
    , DataManager;

/**
 * Data manager static class.
 * @class server.DataManager
 * @classdesc Utility class for loading and serving game data.
 */
DataManager = {
    _basePath: null
    , _entities: null
    , _tilemaps: null
    , _images: null
    /**
     * Loads data from the given path.
     * @method server.DataManager#loadData
     * @param {string} path - Data path.
     */
    , loadData: function(basePath) {
        this._basePath = basePath;
        this._entities = {};
        this._tilemaps = {};
        this._images = {};

        this.parseEntityData();
        this.parseTilemapData();

        console.log(' game data loaded');
    }
    /**
     * Parses all entity data entires.
     * @method server.DataManager#parseEntityData
     */
    , parseEntityData: function() {
        var dataPath = path.join(this._basePath, 'entities');
        this._entities = this.parseDataFiles(dataPath);
    }
    /**
      * Parses all tilemap data entires.
      * @method server.DataManager#parseTilemapData
      */
    , parseTilemapData: function() {
        var dataPath = path.join(this._basePath, 'tilemaps');
        this._tilemaps = this.parseDataFiles(dataPath);
    }
    /**
     * Parses data files from the given path.
     * @method server.DataManager#parseDataFiles
     * @param {string} dataPath - Data path.
     */
    , parseDataFiles: function(dataPath) {
        var data = {}
            , json;

        fs.readdirSync(dataPath).filter(function (file) {
            return fs.statSync(path.join(dataPath, file)).isFile();
        }).forEach(function (file) {
            json = require(path.join(dataPath, file));

            // load data json
            if (json.data) {
                json.data = require(path.join(this._basePath, json.data));
            }

            // map assets so that they can later be passed to the client
            if (json.assets) {
                for (var key in json.assets) {
                    if (json.assets.hasOwnProperty(key)) {
                        this._images[key] = json.assets[key];
                    }
                }
            }

            data[json.key] = json;
        }.bind(this));

        return data;
    }
    /**
     * Returns all images found while parsing data files.
     * @method server.DataManager#getImages
     * @return {object} Map of images (key => src).
     */
    , getImages: function() {
        return this._images;
    }
    /**
     * Returns the data for a specific entity.
     * @method server.DataManager#getEntity
     * @param {string} key - Entity key.
     * @return {object} Entity data.
     */
    , getEntity: function(key) {
        return this._entities[key];
    }
    /**
      * Returns the data for a specific tilemap.
      * @method server.DataManager#getTilemap
      * @param {string} key - Tilemap key.
      * @return {object} Tilemap data.
      */
    , getTilemap: function(key) {
        return this._tilemaps[key];
    }
};

module.exports = DataManager;

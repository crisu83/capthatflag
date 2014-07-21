'use strict';

var _ = require('lodash')
    , path = require('path')
    , fs = require('fs')
    , DataManager;

/**
 * Data manager static class.
 * @class server.core.DataManager
 * @classdesc Utility class for loading and serving game data.
 */
DataManager = {
    /**
     * Loads data from the given path.
     * @method server.core.DataManager#loadData
     * @param {string} path - Data path.
     */
    loadData: function(basePath) {
        // internal variables
        this._basePath = basePath;
        this._entities = {};
        this._tilemaps = {};
        this._images = {};
        this._spritesheets = {};

        this.parseEntityData();
        this.parseTilemapData();

        console.log(' game data loaded');
    }
    /**
     * Parses all entity data entires.
     * @method server.core.DataManager#parseEntityData
     */
    , parseEntityData: function() {
        var dataPath = path.join(this._basePath, 'entities');
        this._entities = this.parseDataFiles(dataPath);
    }
    /**
      * Parses all tilemap data entires.
      * @method server.core.DataManager#parseTilemapData
      */
    , parseTilemapData: function() {
        var dataPath = path.join(this._basePath, 'tilemaps');
        this._tilemaps = this.parseDataFiles(dataPath);
    }
    /**
     * Parses data files from the given path.
     * @method server.core.DataManager#parseDataFiles
     * @param {string} dataPath - Data path.
     */
    , parseDataFiles: function(dataPath) {
        var data = {}
            , json;

        fs.readdirSync(dataPath).filter(function (file) {
            return fs.statSync(path.join(dataPath, file)).isFile();
        }).forEach(function (file) {
            json = require(path.join(dataPath, file));
            json.attrs = json.attrs || {};

            // load data json
            if (json.data) {
                json.data = require(path.join(this._basePath, json.data));
            }

            // map assets so that they can later be passed to the client
            if (json.assets) {
                if (json.assets.images) {
                    _.forOwn(json.assets.images, function(src, key) {
                        this._images[key] = src;
                    }, this);
                }
                if (json.assets.spritesheets) {
                    _.forOwn(json.assets.spritesheets, function(spritesheet, key) {
                        this._spritesheets[key] = {
                            src: spritesheet.src
                            , width: spritesheet.width || json.attrs.width || 0
                            , height: spritesheet.height || json.attrs.height || 0
                            , frames: spritesheet.frames
                        };
                    }, this);
                }
            }

            data[json.key] = json;
        }.bind(this));

        return data;
    }
    /**
     * Returns all images found while parsing data files.
     * @method server.core.DataManager#getImages
     * @return {object} Map of images (key => src).
     */
    , getImages: function() {
        return this._images;
    }
    /**
     * TODO
     */
    , getSpritesheets: function() {
        return this._spritesheets;
    }
    /**
     * Returns the data for a specific entity.
     * @method server.core.DataManager#getEntity
     * @param {string} key - Entity key.
     * @return {object} Entity data.
     */
    , getEntity: function(key) {
        return this._entities[key];
    }
    /**
      * Returns the data for a specific tilemap.
      * @method server.core.DataManager#getTilemap
      * @param {string} key - Tilemap key.
      * @return {object} Tilemap data.
      */
    , getTilemap: function(key) {
        return this._tilemaps[key];
    }
};

module.exports = DataManager;

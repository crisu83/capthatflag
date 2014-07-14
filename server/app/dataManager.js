'use strict';

var path = require('path')
    , fs = require('fs')
    , DataManager;

/**
 * TODO
 */
DataManager = {
    _basePath: null
    , _entities: null
    , _tilemaps: null
    , _images: null
    /**
     * TODO
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
     * TODO
     */
    , parseEntityData: function() {
        var dataPath = path.join(this._basePath, 'entities');
        this._entities = this.parseDataFiles(dataPath);
    }
    /**
     * TODO
     */
    , parseTilemapData: function() {
        var dataPath = path.join(this._basePath, 'tilemaps');
        this._tilemaps = this.parseDataFiles(dataPath);
    }
    /**
     * TODO
     */
    , parseDataFiles: function(dataPath, target) {
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
     * TODO
     */
    , getImages: function() {
        return this._images;
    }
    /**
     * TODO
     */
    , getEntity: function(key) {
        return this._entities[key];
    }
    /**
     * TODO
     */
    , getTilemap: function(key) {
        return this._tilemaps[key];
    }
};

module.exports = DataManager;

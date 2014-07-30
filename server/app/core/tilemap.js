'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , Wall = require('../../../shared/core/wall')
    , Base = require('./base')
    , Body = require('../../../shared/physics/body')
    , List = require('../../../shared/utils/list')
    , Hashmap = require('../../../shared/utils/hashmap')
    , EntityFactory = require('./entityFactory')
    , Tilemap;

/**
 * Tilemap class.
 * @class server.core.Tilemap
 * @classdesc Final class for tilemaps.
 */
Tilemap = utils.inherit(null, {
    /**
     * Creates a new tilemap.
     * @constructor
     * @param {object} data - Tilemap data.
     * @param {object} config - Game configuration.
     */
    constructor: function(data, config) {
        /**
         * @property {string} id - Tilemap identifier.
         */
        this.id = data.id;
        /**
         * @property {string} key - Tilemap key.
         */
        this.key = data.key;
        /**
         * @property {object} data - Tilemap data.
         */
        this.data = data.data;
        /**
         * @property {number} type - Tilemap type.
         */
        this.type = data.type;
        /**
         * @property {number} width - Width of the map in number of tiles.
         */
        this.width = data.data.width;
        /**
         * @property {number} height - Height of the map in number of tiles.
         */
        this.height = data.data.height;
        /**
         * @property {number} tileWidth - Width of each tile in pixels.
         */
        this.tileWidth = data.data.tilewidth;
        /**
         * @property {number} tileHeight - Height of each tile in pixels.
         */
        this.tileHeight = data.data.tileheight;
        /**
         * @property {array} layers - Tilemap layers.
         */
        this.layers = data.layers;
        /**
         * @property {string} collision - Name of the collision layer.
         */
        this.collision = data.collision;
        /**
         * @property {string} flags - Name of the flag layer.
         */
        this.flags = data.flags;
        /**
         * @property {string} bases - Name of the base layer.
         */
        this.bases = data.bases;
        /**
         * @property {string} image - Tilemap image key.
         */
        this.image = data.image;
        /**
         * @property {string} music - Tilemap music key.
         */
        this.music = data.music;
        /**
         * @property {array} entities - Entities on this map.
         */
        this.entities = data.entities;
        /**
         * @property {object} config - Game configuration.
         */
        this.config = config;

        // internal properties
        this.room = null;
        this._walls = new List();
        this._bases = new Hashmap();
    }
    /**
     * Initializes the tilemap.
     * @method server.core.Tilemap#init
     */
    , init: function() {
        // loop through the layers to find the collision layer
        _.forOwn(this.data.layers, function(layer) {
            switch (layer.name) {
                case this.collision:
                    this.parseCollisionLayer(layer);
                    break;
                case this.flags:
                    this.parseFlagLayer(layer);
                    break;
                case this.bases:
                    this.parseBaseLayer(layer);
                    break;
                default:
                    break;
            }
        }, this);
    }
    /**
     * TODO
     */
    , parseCollisionLayer: function(layer) {
        var wall, body;

        _.forOwn(layer.objects, function(object) {
            wall = new Wall(object.x, object.y, object.width, object.height);
            body = new Body('wall', wall);
            body.x = wall.x;
            body.y = wall.y;
            body.width = wall.width;
            body.height = wall.height;
            this.room.world.add(body);
            this._walls.add(wall);
        }, this);
    }
    /**
     * TODO
     */
    , parseFlagLayer: function(layer) {
        var entity;

        _.forOwn(layer.objects, function(object) {
            entity = EntityFactory.create(object.type);
            entity.attrs.set({x: object.x, y: object.y});
            this.room.entities.add(entity.id, entity);
            this.room.flagCount++;
        }, this);
    }
    /**
     * TODO
     */
    , parseBaseLayer: function(layer) {
        var base, body;

        _.forOwn(layer.objects, function(object) {
            base = new Base(object.name, object.x, object.y, object.width, object.height);
            body = new Body('base', base);
            body.x = base.x;
            body.y = base.y;
            body.width = base.width;
            body.height = base.height;
            this._bases.set(object.name, base);
        }, this);
    }
    /**
     * Returns the walls on the tilemap.
     * @method server.core.Tilemap#getWalls
     * @return {array} List of walls.
     */
    , getWalls: function() {
        var walls = [];

        this._walls.each(function(wall) {
            walls.push(wall.serialize());
        }, this);

        return walls;
    }
    /**
     * Returns a specific base from this tilemap.
     * @method server.core.Tilemap#getBase
     * @return {server.core.Base} Base instance.
     */
    , getBase: function(key) {
        return this._bases.get(key);
    }
});

module.exports = Tilemap;

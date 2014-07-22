'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
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
         * @property {array} layers - Tilemap layers.
         */
        this.layers = data.layers;
        /**
         * @property {string} image - Tilemap image key.
         */
        this.image = data.image;
        /**
         * @property {array} entities - Entities on this map.
         */
        this.entities = data.entities;
        /**
         * @property {object} config - Game configuration.
         */
        this.config = config;
        /**
         * @property {server.core.Room} room - Room instance.
         */
        this.room = null;
    }
    /**
     * Initializes the tilemap.
     * @method server.core.Tilemap#init
     */
    , init: function() {
        var entity;

        _.forOwn(this.entities, function(json) {
            var entity = EntityFactory.create('flag')
                , attrs = json.attrs || {};

            entity.attrs.set(attrs);

            this.room.entities.add(entity.id, entity);
        }, this);
    }
});

module.exports = Tilemap;

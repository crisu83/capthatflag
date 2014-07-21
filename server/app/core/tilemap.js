'use strict';

var utils = require('../../../shared/utils')
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
     */
    constructor: function(data) {
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
    }
});

module.exports = Tilemap;

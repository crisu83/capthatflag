'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , Tile;

/**
 * Tile class.
 * @class shared.core.Tile
 * @classdesc Represents a single tile.
 */
Tile = utils.inherit(null, {
    /**
     * Creates a new tile.
     * @constructor
     */
    constructor: function(x, y, width, height) {
        // internal properties
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    /**
     * Serializes the tile to JSON.
     * @method server.core.Tile#serialize
     * @return {object} Serialized tile.
     */
    , serialize: function() {
        return {
            x: this.x
            , y: this.y
            , width: this.width
            , height: this.height
        };
    }
});

module.exports = Tile;

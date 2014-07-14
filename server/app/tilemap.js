'use strict';

var utils = require('../../shared/utils')
    , Tilemap;

/**
 * TODO
 */
Tilemap = utils.inherit(null, {
    key: 'tilemap'
    , id: null
    , data: null
    , type: null
    , layers: null
    , image: null
    /**
     * TODO
     */
    , constructor: function(data) {
        this.id = data.id;
        this.key = data.key;
        this.data = data.data;
        this.type = data.type;
        this.layers = data.layers;
        this.image = data.image;
    }
});

module.exports = Tilemap;

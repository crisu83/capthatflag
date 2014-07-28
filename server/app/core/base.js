'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , Base;

/**
 * Base class.
 * @class server.core.Base
 * @classdesc Represents a team base on the map.
 */
Base = utils.inherit(null, {
    /**
     * Creates a new base.
     * @constructor
     */
    constructor: function(key, x, y, width, height) {
        /**
         * @property {string} key - Base key.
         */
        this.key = key;

        // internal properties
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    /**
     * Serializes the base to JSON.
     * @method server.core.Base#serialize
     * @return {object} Serialized base.
     */
    , serialize: function() {
        return {
            x: this.x
            , y: this.y
            , width: this.width
            , height: this.height
        };
    }
    /**
     * TODO
     */
    , right: function() {
        return this.x + this.width;
    }
    /**
     * TODO
     */
    , bottom: function() {
        return this.y + this.height;
    }
});

module.exports = Base;

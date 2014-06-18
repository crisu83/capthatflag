'use strict';

var utils = require('../utils');

// base player class
var Player = utils.inherit(null, {
    x: null
    , y: null
    , image: null
    // constructor
    , constructor: function(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
    }
    // converts the player state to json
    , toJSON: function() {
        return {
            x: this.x
            , y: this.y
            , image: this.image
        };
    }
    // sets the player state from json
    , fromJSON: function(json) {
        this.x = Math.round(json.x);
        this.y = Math.round(json.y);
        this.image = json.image;
    }
});

module.exports = Player;

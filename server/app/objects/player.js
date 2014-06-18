'use strict';

var utils = require('../../../shared/utils'),
    PlayerBase = require('../../../shared/objects/player');

// server-side player class
var Player = utils.inherit(PlayerBase, {
    clientId: null
    // converts the player state to json
    , toJSON: function() {
        return {
            x: this.x
            , y: this.y
            , image: this.image
            , clientId: this.clientId
        };
    }
});

module.exports = Player;

'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../../../../shared/utils')
    , Entity = require('../../../../shared/entity');

// server-side player class
var Player = utils.inherit(Entity, {
    key: 'player'
    , id: null
    , width: 32
    , height: 32
    , speed: 150
    , clientId: null
    , constructor: function(x, y, image) {
        Entity.apply(this);

        this.id = shortid.generate();
    }
    // converts the player state to json
    , toJSON: function() {
        return _.extend(
            Entity.prototype.toJSON.apply(this, arguments)
            , {clientId: this.clientId}
        );
    }
});

module.exports = Player;

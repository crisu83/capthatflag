'use strict';

var _ = require('lodash')
    , utils = require('../../../../shared/utils')
    , Entity = require('../../../../shared/entity');

// server-side player class
var Player = utils.inherit(Entity, {
    key: 'player'
    , width: 32
    , height: 32
    , clientId: null
    // converts the player state to json
    , toJSON: function() {
        return _.extend(
            Entity.prototype.toJSON.apply(this, arguments)
            , {clientId: this.clientId}
        );
    }
});

module.exports = Player;

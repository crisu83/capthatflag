define([
    'phaser'
    , 'shared/utils'
    , 'shared/entity'
], function (Phaser, utils, Entity) {
    'use strict';

    // client-side player class
    var Player = utils.inherit(Entity, {
        key: 'player'
        , width: 32
        , height: 32
        , speed: 150
    });

    return Player;
});

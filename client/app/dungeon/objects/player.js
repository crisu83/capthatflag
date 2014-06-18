define([
    'shared/utils'
    , 'shared/objects/player'
], function (utils, PlayerBase) {
    'use strict';

    // client-side player class
    var Player = utils.inherit(PlayerBase, {
        sprite: null
    });

    return Player;
});

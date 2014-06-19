define([
    'phaser'
    , 'shared/utils'
    , 'shared/objects/player'
], function (Phaser, utils, PlayerBase) {
    'use strict';

    // client-side player class
    var Player = utils.inherit(PlayerBase, {
        sprite: null
        , runSpeed: 100
        , dustEmitter: null
        , create: function(game) {
            // setup dust particle emitter
            var emitter = game.add.emitter(0, 0, 10);
            emitter.makeParticles('smoke');
            emitter.setAlpha(0.1, 0.0);
            emitter.setXSpeed(-50, 50);
            emitter.setYSpeed(-5, -20);
            emitter.setScale(1, 2, 1, 2, 6000, Phaser.Easing.Quintic.Out);
            emitter.gravity = -300;
            emitter.start(false, 200, 1);

            this.dustEmitter = emitter;
        }
        , update: function(game) {
            // todo: move logic here from the game
        }
    });

    return Player;
});

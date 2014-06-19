define([
    'phaser'
    , 'shared/utils'
    , 'shared/objects/player'
], function (Phaser, utils, PlayerBase) {
    'use strict';

    // client-side player class
    var Player = utils.inherit(PlayerBase, {
        socket: null
        , width: 32
        , height: 32
        , sprite: null
        , runSpeed: 100
        , dustEmitter: null
        // loads player assets
        , preload: function(game) {
            // pre-load sprite images
            game.load.image('male', 'static/images/male.png');
            game.load.image('female', 'static/images/female.png');
            game.load.image('smoke', 'static/images/smoke.png');
        }
        // creates the player
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
        // updates the player logic
        , update: function(game) {
            // check if the player is moving
            if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
                // create dust particles when moving
                // and let the server know that we moved
                this.dustEmitter.visible = true;
                this.socket.emit('player.move', this.toJSON());
            } else {
                // hide dust when standing still
                this.dustEmitter.visible = false;
            }

            // move the dust emitter according to the players position
            this.dustEmitter.emitX = this.sprite.body.x + this.width / 2;
            this.dustEmitter.emitY = this.sprite.body.y + this.height - 4;

            // update the state with the correct position
            this.x = this.sprite.body.x;
            this.y = this.sprite.body.y;
        }
        , setSprite: function(sprite) {
            sprite.physicsBodyType = Phaser.Physics.ARCADE;
            sprite.body.collideWorldBounds = true;
            sprite.body.immovable = true;

            this.x = sprite.body.x;
            this.y = sprite.body.y;
            this.image = sprite.key;
            this.sprite = sprite;
        }
        , getState: function() {

        }
    });

    return Player;
});

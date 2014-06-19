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
        // loads player assets
        , preload: function(game) {
            // pre-load sprite images
            game.load.image('male', 'static/assets/images/sprites/male.png');
            game.load.image('female', 'static/assets/images/sprites/female.png');
        }
        // creates the player
        , create: function(game) {

        }
        // updates the player logic
        , update: function(game) {
            // check if the player is moving
            if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
                // update the player state and let the server know that we moved
                this.x = this.sprite.x;
                this.y = this.sprite.y;
                this.socket.emit('player.move', this.toJSON());
            }
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
        , fromJSON: function(json) {
            PlayerBase.prototype.fromJSON.apply(this, arguments);

            // update sprite position as well
            if (json.x && this.sprite) {
                this.sprite.x = json.x;
            }
            if (json.y && this.sprite) {
                this.sprite.y = json.y;
            }
        }
    });

    return Player;
});

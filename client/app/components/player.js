'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/player')
    , PlayerComponent;

/**
 * Player component class.
 * @class client.components.PlayerComponent
 * @classdesc Component that adds player functionality.
 * @extends shared.core.Component
 */
PlayerComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {Phaser.Sprite} sprite - Sprite instance.
     */
    constructor: function(sprite) {
        ComponentBase.apply(this);

        // Add the player animations
        sprite.animations.add('standStill', [0]);
        sprite.animations.add('walkDown', [0, 1, 2, 3, 4, 5]);
        sprite.animations.add('walkRight', [6, 7, 8, 9, 10, 11]);
        sprite.animations.add('walkUp', [12, 13, 14, 15, 16, 17]);
        sprite.animations.add('walkLeft', [18, 19, 20, 21, 22, 23]);

        // internal properties
        this._sprite = sprite;
        this._lastDirection = 'none';
        this._lastAlive = true;
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.updatePosition();
        this.updateAlive();
        this.updateAnimation();
    }
    /**
     * Updates the position of the player.
     * @method client.components.PlayerComponent#updatePosition
     */
    , updatePosition: function() {
        var position = this.owner.attrs.get(['x', 'y']);

        this._sprite.x = position.x;
        this._sprite.y = position.y;
    }
    /**
     * Updates the aliveness of the player.
     * @method client.components.PlayerComponent#updateAlive
     */
    , updateAlive: function() {
        var alive = this.owner.attrs.get('alive');

        if (alive === false && this._lastAlive) {
            this._sprite.kill();
            this.owner.die();
        } else if (alive && !this._lastAlive) {
            this._sprite.revive();
            this.owner.revive();
        }

        this._lastAlive = alive;
    }
    /**
     * Updates the player animations.
     * @method client.components.PlayerComponent#updateAnimation
     */
    , updateAnimation: function() {
        if (this._lastAlive) {
            var direction = this.owner.attrs.get('direction');

            if (direction !== this._lastDirection) {
                var animation;

                switch (direction) {
                    case 'left':
                        animation = 'walkLeft';
                        break;
                    case 'up':
                        animation = 'walkUp';
                        break;
                    case 'right':
                        animation = 'walkRight';
                        break;
                    case 'down':
                        animation = 'walkDown';
                        break;
                    default:
                    case 'none':
                        animation = 'standStill';
                        break;
                }

                this._sprite.animations.play(animation, 10, true);
            }

            this._lastDirection = direction;
        }
    }
});

module.exports = PlayerComponent;

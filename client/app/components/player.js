'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
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
     * @param {Phaser.Sprite} sprite sprite instance
     */
    constructor: function(sprite) {
        ComponentBase.apply(this);

        // Add the player animations
        sprite.animations.add('standStill', [0]);
        sprite.animations.add('walkDown', [0, 1, 2, 3, 4, 5]);
        sprite.animations.add('walkRight', [6, 7, 8, 9, 10, 11]);
        sprite.animations.add('walkUp', [12, 13, 14, 15, 16, 17]);
        sprite.animations.add('walkLeft', [18, 19, 20, 21, 22, 23]);

        // inherited properties
        this.key = 'player';
        this.phase = ComponentBase.prototype.phases.MOVEMENT;

        /**
         * @property {Phaser.Sprite} sprite - Sprite instance.
         */
        this.sprite = sprite;

        // internal properties
        this._lastDirection = 'none';
    }
    /**
     * @override
     */
    , init: function() {
        this.owner.on('entity.die', this.onEntityDeath.bind(this));
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.setPosition(this.owner.attrs.get(['x', 'y']));
        this.updateAnimation();
    }
    /**
     * Updates the animations for the player.
     * @method client.components.PlayerComponent#updateAnimation
     */
    , updateAnimation: function() {
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

            this.sprite.animations.play(animation, 10, true);
        }

        this._lastDirection = direction;
    }
    /**
     * Event handler for when the entity dies.
     * @method client.components.ActorComponent#onEntityDeath
     */
    , onEntityDeath: function() {
        this.sprite.kill();
    }
    /**
     * Sets the position for the associated sprite.
     * @method client.components.ActorComponent#setPosition
     * @param {number} x - Coordinates on the x-axis.
     * @param {number} y - Coordinates on the y-axis.
     */
    , setPosition: function(position) {
        this.sprite.x = position.x;
        this.sprite.y = position.y;
    }
});

module.exports = PlayerComponent;

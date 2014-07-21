'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , PlayerComponent;

/**
 * Player component class.
 * @class client.components.PlayerComponent
 * @classdesc Component that adds player support for the associated entity.
 * @extends shared.Component
 */
PlayerComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {Phaser.Sprite} sprite sprite instance
     */
    constructor: function(sprite) {
        // Add the player animations
        sprite.animations.add('walkDown', [0]);
        sprite.animations.add('walkRight', [1]);
        sprite.animations.add('walkUp', [2]);
        sprite.animations.add('walkLeft', [3]);

        // inherited properties
        this.key = 'player';
        this.phase = ComponentBase.prototype.phases.RENDER;

        /**
         * @property {Phaser.Sprite} sprite - Sprite instance.
         */
        this.sprite = sprite;
        /**
         * @property {string} facing - The way the player is facing.
         */
        this.facing = 'down';
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
        this.updatePosition(this.owner.attrs.get(['x', 'y']));
        this.updateFacing();
    }
    /**
     * Updates the position for the associated sprite.
     * @method client.components.ActorComponent#updatePosition
     * @param {number} x - Coordinates on the x-axis.
     * @param {number} y - Coordinates on the y-axis.
     */
    , updatePosition: function(position) {
        this.sprite.x = position.x;
        this.sprite.y = position.y;
    }
    /**
     * Updates the logic for direction that the player is facing.
     * @method client.components.PlayerComponent#updateFacing
     */
    , updateFacing: function() {
        var dx = this.sprite.deltaX
            , dy = this.sprite.deltaY
            , newFacing;

        if (dx > 0) {
            newFacing = 'right';
        } else if (dx < 0) {
            newFacing = 'left';
        } else if (dy < 0) {
            newFacing = 'up';
        } else if (dy > 0) {
            newFacing = 'down';
        }

        // sometimes the sprite delta position might be incorrectly set
        // so we require that the facing is two times the same
        // before we change the active animation
        if (newFacing && newFacing === this.facing) {
            var animation;

            switch (newFacing) {
                case 'left':
                    animation = 'walkLeft';
                    break;
                case 'up':
                    animation = 'walkUp';
                    break;
                case 'right':
                    animation = 'walkRight';
                    break;
                default:
                case 'down':
                    animation = 'walkDown';
                    break;
            }

            this.sprite.animations.play(animation, 20, true);
        }

        this.facing = newFacing;
    }
    /**
     * Event handler for when the entity dies.
     * @method client.components.ActorComponent#onEntityDeath
     */
    , onEntityDeath: function() {
        this.sprite.kill();
    }
});

module.exports = PlayerComponent;

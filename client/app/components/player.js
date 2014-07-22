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
        sprite.animations.add('walkDown', [0]);
        sprite.animations.add('walkRight', [1]);
        sprite.animations.add('walkUp', [2]);
        sprite.animations.add('walkLeft', [3]);

        // inherited properties
        this.key = 'player';
        this.phase = ComponentBase.prototype.phases.MOVEMENT;

        /**
         * @property {Phaser.Sprite} sprite - Sprite instance.
         */
        this.sprite = sprite;

        // internal properties
        this._lastFacing = null;
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
        this.updateFacing();
    }
    /**
     * Updates the direction that the player is facing.
     * @method client.components.PlayerComponent#updateFacing
     */
    , updateFacing: function() {
        var facing = this.owner.attrs.get('facing');

        if (facing !== this._lastFacing) {
            var animation;

            switch (facing) {
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

        this._lastFacing = facing;
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

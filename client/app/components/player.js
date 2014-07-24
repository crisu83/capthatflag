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
     */
    constructor: function() {
        ComponentBase.apply(this);

        // internal properties
        this._sprite = null;
        this._lastDirection = 'none';
        this._lastAlive = true;
    }
    , init: function() {
        var playerSprite, graveSprite;

        this._sprite = this.owner.components.get('sprite');

        playerSprite = this._sprite.get('player');
        playerSprite.animations.add('standStill', [0]);
        playerSprite.animations.add('walkDown', [0, 1, 2, 3, 4, 5]);
        playerSprite.animations.add('walkRight', [6, 7, 8, 9, 10, 11]);
        playerSprite.animations.add('walkUp', [12, 13, 14, 15, 16, 17]);
        playerSprite.animations.add('walkLeft', [18, 19, 20, 21, 22, 23]);
        playerSprite.animations.play('standStill', 15, true);

        graveSprite = this._sprite.get('grave');
        graveSprite.animations.add('default', [0]);
        graveSprite.kill();
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
        this._sprite.setPosition('player', position);
    }
    /**
     * Updates the aliveness of the player.
     * @method client.components.PlayerComponent#updateAlive
     */
    , updateAlive: function() {
        var alive = this.owner.attrs.get('alive')
            , position = this.owner.attrs.get(['x', 'y']);

        if (alive === false && this._lastAlive) {
            this._sprite.kill('player');
            this._sprite.setPosition('grave', position);
            this._sprite.revive('grave');
            this.owner.die();
        } else if (alive === true && !this._lastAlive) {
            this._sprite.kill('grave');
            this._sprite.revive('player');
            this.owner.revive();
        }

        this._lastAlive = alive;
    }
    /**
     * Updates the player animations.
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

            this._sprite.playAnimation('player', animation, 15, true);

            this._lastDirection = direction;
        }
    }
});

module.exports = PlayerComponent;

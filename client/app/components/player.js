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
    constructor: function(nameText) {
        ComponentBase.apply(this);

        // internal properties
        this._sprite = null;
        this._nameText = nameText;
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

        this.owner.on('entity.remove', this.onEntityRemove.bind(this));
    }
    /**
     * TODO
     */
    , onEntityRemove: function() {
        this._nameText.destroy();
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.updateAlive();
        this.updateAnimation();
        this.updateNameText();
        this.updatePosition();
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
            , position;

        if (alive === false && this._lastAlive) {
            position = this.owner.attrs.get(['x', 'y']);
            this._sprite.kill('player');
            this._sprite.kill('attack');
            this._sprite.setPosition('grave', position);
            this._sprite.revive('grave');
            this.owner.die();
        } else if (alive === true && !this._lastAlive) {
            position = this.owner.attrs.get(['spawnX', 'spawnY']);
            this._sprite.kill('grave');
            this.owner.attrs.set({x: position.spawnX, y: position.spawnY});
            this._sprite.revive('player');
            this._sprite.revive('attack');
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

            this._sprite.playAnimation('player', animation, 10, true);

            this._lastDirection = direction;
        }
    }
    /**
     * TODO
     */
    , updateNameText: function() {
        var alive = this.owner.attrs.get('alive');

        if (_.isUndefined(alive) || alive === true) {
            var position = this.owner.attrs.get(['x', 'y'])
                , width = this.owner.attrs.get('width');

            this._nameText.x = position.x + (width / 2) - (this._nameText.width / 2);
            this._nameText.y = position.y - 10;
        }
    }
});

module.exports = PlayerComponent;

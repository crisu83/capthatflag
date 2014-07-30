'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/player')
    , PlayerComponent;

/**
 * Player component class.
 * @class client.components.PlayerComponent
 * @classdesc Component that adds player functionality.
 * @extends shared.components.Player
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
        this._sound = null;
        this._text = null;
        this._lastDirection = 'none';
        this._lastAlive = true;
        this._respawnTime = null;
    }
    , init: function() {
        var playerSprite, graveSprite, nameText, respawnText;

        this._sprite = this.owner.components.get('sprite');
        this._text = this.owner.components.get('text');
        this._sound = this.owner.components.get('sound');

        playerSprite = this._sprite.get('player');
        playerSprite.animations.add('standStill', [0]);
        playerSprite.animations.add('walkDown', [0, 1, 2, 3]);
        playerSprite.animations.add('walkLeft', [4, 5, 6, 7]);
        playerSprite.animations.add('walkUp', [8, 9, 10, 11]);
        playerSprite.animations.add('walkRight', [12, 13, 14, 15]);
        playerSprite.animations.play('standStill', 15, true);

        graveSprite = this._sprite.get('grave');
        graveSprite.animations.add('default', [0]);
        graveSprite.kill();

        nameText = this._text.get('name');
        nameText.anchor.set(0.5, 0.5);
        nameText.text = this.owner.attrs.get('name');

        respawnText = this._text.get('respawn');
        respawnText.anchor.set(0.5, 0);
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.updateAlive();
        this.updateAnimation();
        this.updateSprites();
        this.updateTexts();
    }
    /**
     * Updates the associated sprites.
     * @method client.components.PlayerComponent#updateSprites
     */
    , updateSprites: function() {
        var position = this.owner.attrs.get(['x', 'y']);

        this._sprite.setPosition('player', position);
        this._sprite.setPosition('grave', position);
    }
    /**
     * Updates the associated texts.
     * @method client.components.PlayerComponent#updateTexts
     */
    , updateTexts: function() {
        var position = this.owner.attrs.get(['x', 'y'])
            , width = this.owner.attrs.get('width')
            , alive = this.owner.attrs.get('alive');

        if (_.isUndefined(alive) || alive === true) {
            this._text.setPosition('name', {x: position.x + (width * 0.5), y: position.y});
        } else {
            var respawnSec = this.owner.attrs.get('respawnSec')
                , lastDeadAt = this.owner.attrs.get('lastDeadAt');

            if (_.isNumber(respawnSec) && _.isNumber(lastDeadAt)) {
                this._text.setPosition('respawn', {x: position.x + (width * 0.5), y: position.y + 10});
                this._text.setText('respawn', respawnSec - Math.round((_.now() - lastDeadAt) / 1000));
            }
        }
    }
    /**
     * Updates the aliveness of the player.
     * @method client.components.PlayerComponent#updateAlive
     */
    , updateAlive: function() {
        var alive = this.owner.attrs.get('alive');

        if (alive === false && this._lastAlive) {
            this._lastDeadAt = _.now();
            this._sound.play('die');
            this._sprite.kill('player');
            this._sprite.kill('attack');
            this._sprite.revive('grave');
            this._text.revive('respawn');
            this.owner.die();
        } else if (alive === true && !this._lastAlive) {
            var position = this.owner.attrs.get(['spawnX', 'spawnY']);
            this._sprite.kill('grave');
            this._text.kill('respawn');
            this.owner.attrs.set({x: position.spawnX, y: position.spawnY});
            this._sprite.revive('player');
            this._sprite.revive('attack');
            this.owner.revive();
            this._lastDeadAt = null;
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

            this._sprite.play('player', animation, 15, true);
            this._lastDirection = direction;
        }
    }
});

module.exports = PlayerComponent;

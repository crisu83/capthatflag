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
        this._attack = null;
        this._lastDirection = 'none';
        this._lastAction = 'none';
        this._lastAlive = true;
        this._respawnTime = null;
    }
    , init: function() {
        var playerSprite, graveSprite, nameText, respawnText;

        this._sprite = this.owner.components.get('sprite');
        this._text = this.owner.components.get('text');
        this._sound = this.owner.components.get('sound');

        playerSprite = this._sprite.get('player');
        playerSprite.animations.add('idle', [0]);
        playerSprite.animations.add('runDown', [0, 1, 2, 3]);
        playerSprite.animations.add('runLeft', [4, 5, 6, 7]);
        playerSprite.animations.add('runUp', [8, 9, 10, 11]);
        playerSprite.animations.add('runRight', [12, 13, 14, 15]);
        playerSprite.animations.add('attackDown', [16, 17, 18, 19]);
        playerSprite.animations.add('attackLeft', [20, 21, 22, 23]);
        playerSprite.animations.add('attackUp', [24, 25, 26, 27]);
        playerSprite.animations.add('attackRight', [28, 29, 30, 31]);
        playerSprite.animations.play('idle', 15, true);

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
                this._text.setPosition('respawn', {x: position.x + (width * 0.5), y: position.y + 32});
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
            this._sprite.kill('player');
            this._sprite.revive('grave');
            this._text.revive('respawn');
            this.owner.die();
        } else if (alive === true && !this._lastAlive) {
            this._sprite.kill('grave');
            this._text.kill('respawn');
            this._sprite.revive('player');
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
        var actions = this.owner.attrs.get('actions')
            , facing = this.owner.attrs.get('facing')
            , lastAttackAt = this.owner.attrs.get('lastAttackAt')
            , cooldownMsec = this.owner.attrs.get('attackCooldownMsec');

        if (_.indexOf(actions, 'attack') !== -1 && facing !== 'none') {
            if (!_.isNumber(lastAttackAt) || (_.now() - lastAttackAt) > cooldownMsec) {
                this._sprite.play('player', this.resolveActionAnimation('attack', facing), 15, false);
            }
        } else if (_.indexOf(actions, 'run') !== -1) {
            this._sprite.play('player', this.resolveActionAnimation('run', facing), 15, true);
        } else {
            this._sprite.play('player', 'idle', 15, true);
        }
    }
    /**
     * TODO
     */
    , resolveActionAnimation: function(action, facing) {
        return action + facing.charAt(0).toUpperCase() + facing.slice(1);
    }
});

module.exports = PlayerComponent;

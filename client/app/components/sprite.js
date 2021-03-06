'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , Hashmap = require('../../../shared/utils/hashmap')
    , ComponentBase = require('../../../shared/core/component')
    , SpriteComponent;

/**
 * Sprite component class.
 * @class client.components.SpriteComponent
 * @classdesc Component that adds sprite functionality.
 * @extends shared.core.Component
 */
SpriteComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {object} sprites - Sprite instances.
     */
    constructor: function(sprites) {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'sprite';
        this.phase = ComponentBase.prototype.phases.LOGIC;

        // internal properties
        this._sprites = new Hashmap(sprites);
    }
    /**
     * @override
     */
    , init: function() {
        this.owner.on('entity.remove', this.onEntityRemove.bind(this));
    }
    /**
     * Event handler for when the entity is removed.
     * @method client.components.SpriteComponent#onEntityRemove
     * @param {shared.core.Entity} entity - Entity that was removed.
     */
    , onEntityRemove: function(entity) {
        this._sprites.each(function(sprite) {
            sprite.destroy();
        }, this);
    }
    /**
     * Plays an aniamtion for a specific sprite.
     * @method client.components.SpriteComponent#play
     * @param {string} key - Sprite key.
     * @param {string} animation - Animation key.
     * @param {number} framesPerSec - Number of frames per second.
     * @param {boolean} loop - Whether to loop the animation.
     *
     */
    , play: function(key, animation, framesPerSec, loop) {
        var sprite = this._sprites.get(key);
        if (sprite) {
            sprite.animations.play(animation, framesPerSec, loop);
        }
    }
    /**
     * Kills a specific sprite.
     * @method client.components.SpriteComponent#kill
     * @param {string} key - Sprite key.
     */
    , kill: function(key) {
        var sprite = this._sprites.get(key);
        if (sprite) {
            sprite.kill();
        }
    }
    /**
     * Revives a specific sprite.
     * @method client.components.SpriteComponent#revive
     * @param {string} key - Sprite key.
     */
    , revive: function(key) {
        var sprite = this._sprites.get(key);
        if (sprite) {
            sprite.revive();
        }
    }
    /**
     * Sets the position of a specific sprite.
     * @method  client.components.SpriteComponent#setPosition
     * @param {string} key - Sprite key.
     * @param {object} position - Position object.
     */
    , setPosition: function(key, position) {
        var sprite = this._sprites.get(key);
        if (sprite) {
            sprite.x = position.x;
            sprite.y = position.y;
        }
    }
    /**
     * Returns the sprite associated with the given key.
     * @method client.components.SpriteComponent#get
     * @param {string} key - Sprite key.
     * @return {Phaser.Sprite} Sprite instance.
     */
    , get: function(key) {
        return this._sprites.get(key);
    }
});

module.exports = SpriteComponent;

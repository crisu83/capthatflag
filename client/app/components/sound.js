'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , Hashmap = require('../../../shared/utils/hashmap')
    , ComponentBase = require('../../../shared/core/component')
    , SoundComponent;

/**
 * Sound component class.
 * @class client.components.SoundComponent
 * @classdesc Component that adds sound functionality.
 * @extends shared.core.Component
 */
SoundComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {object} sounds - Sound instances.
     */
    constructor: function(sounds) {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'sound';
        this.phase = ComponentBase.prototype.phases.LOGIC;

        // internal properties
        this._sounds = new Hashmap(sounds);
    }
    /**
     * @override
     */
    , init: function() {
        this.owner.on('entity.remove', this.onEntityRemove.bind(this));
    }
    /**
     * Event handler for when the entity is removed.
     * @method client.components.SoundComponent#onEntityRemove
     * @param {shared.core.Entity} entity - Entity that was removed.
     */
    , onEntityRemove: function(entity) {
        this._sounds.each(function(sound) {
            sound.destroy();
        }, this);
    }
    /**
     * Plays a specific sound.
     * @method client.components.SoundComponent#play
     * @param {string} key - Sound key.
     * @param {boolean} loop - Whether to loop the animation.
     *
     */
    , play: function(key, volume, loop) {
        this._sounds.get(key).play('', 0, volume, loop);
    }
    /**
     * Returns the sound associated with the given key.
     * @method client.components.SoundComponent#get
     * @param {string} key - Sound key.
     * @return {Phaser.Sound} Sound instance.
     */
    , get: function(key) {
        return this._sounds.get(key);
    }
});

module.exports = SoundComponent;

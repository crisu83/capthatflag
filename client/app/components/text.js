'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , Hashmap = require('../../../shared/utils/hashmap')
    , ComponentBase = require('../../../shared/core/component')
    , TextComponent;

/**
 * Text component class.
 * @class client.components.TextComponent
 * @classdesc Component that adds text functionality.
 * @extends shared.core.Component
 */
TextComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {object} texts - Text instances.
     */
    constructor: function(texts) {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'text';
        this.phase = ComponentBase.prototype.phases.LOGIC;

        // internal properties
        this._texts = new Hashmap(texts);
    }
    /**
     * @override
     */
    , init: function() {
        this.owner.on('entity.remove', this.onEntityRemove.bind(this));
    }
    /**
     * Event handler for when the entity is removed.
     * @method client.components.TextComponent#onEntityRemove
     * @param {shared.core.Entity} entity - Entity that was removed.
     */
    , onEntityRemove: function(entity) {
        this._texts.each(function(text) {
            text.destroy();
        }, this);
    }
    /**
     * Sets the text for a specific text.
     * @method client.components.TextComponent#setText
     * @param {string} key - Text key.
     * @param {string} text - New text.
     */
    , setText: function(key, text) {
        this._texts.get(key).text = text;
    }
    /**
     * Kills a specific text.
     * @method client.components.TextComponent#kill
     * @param {string} key - Text key.
     */
    , kill: function(key) {
        this._texts.get(key).visible = false;
    }
    /**
     * Revives a specific text.
     * @method client.components.TextComponent#revive
     * @param {string} key - Text key.
     */
    , revive: function(key) {
        this._texts.get(key).visible = true;
    }
    /**
     * Sets the position of a specific text.
     * @method  client.components.TextComponent#setPosition
     * @param {string} key - Sprite key.
     * @param {object} position - Position object.
     */
    , setPosition: function(key, position) {
        var text = this._texts.get(key);
        text.x = position.x;
        text.y = position.y;
    }
    /**
     * Returns the text associated with the given key.
     * @method client.components.TextComponent#get
     * @param {string} key - Text key.
     * @return {Phaser.Sprite} Text instance.
     */
    , get: function(key) {
        return this._texts.get(key);
    }
});

module.exports = TextComponent;

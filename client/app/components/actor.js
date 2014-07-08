'use strict';

var utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/component')
    , ActorComponent;

/**
 * Actor component class.
 * @class client.components.ActorComponent
 * @classdesc Component that adds support for a sprite to the entity.
 * @extends shared.Component
 * @property {Phaser.Sprite} sprite - Associated sprite object.
 */
ActorComponent = utils.inherit(ComponentBase, {
    key: 'actor'
    , phase: ComponentBase.prototype.phases.INPUT
    , sprite: null
    /**
     * Creates a new component.
     * @constructor
     * @param {Phaser.Sprite} sprite sprite instance
     */
    , constructor: function(sprite) {
        this.sprite = sprite;
    }
    /**
     * @override
     */
    , init: function() {
        // bind event handlers
        this.owner.on('entity.sync', this.onEntitySync.bind(this));
        this.owner.on('entity.die', this.onEntityDeath.bind(this));
    }
    /**
     * Event handler for when the entity is synchronized.
     * @method client.components.ActorComponent#onEntitySync
     * @param {object} state - Synchronized entity state.
     */
    , onEntitySync: function(state) {
        this.setPosition(state.x, state.y);
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
     * @method client.components.ActorComponent#setPostiion
     * @param {number} x - Coordinates on the x-axis.
     * @param {number} y - Coordinates on the y-axis.
     */
    , setPosition: function(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
    }
});

module.exports = ActorComponent;

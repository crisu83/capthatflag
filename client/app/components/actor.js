'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , ActorComponent;

/**
 * Actor component class.
 * @class client.components.ActorComponent
 * @classdesc Component that adds sprite support for the associated entity.
 * @extends shared.Component
 * @property {Phaser.Sprite} sprite - Sprite instance.
 */
ActorComponent = utils.inherit(ComponentBase, {
    key: 'actor'
    , phase: ComponentBase.prototype.phases.RENDER
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
        this.owner.on('entity.die', this.onEntityDeath.bind(this));
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.setPosition(this.owner.attrs.get(['x', 'y']));
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
    , setPosition: function(position) {
        this.sprite.x = position.x;
        this.sprite.y = position.y;
    }
});

module.exports = ActorComponent;

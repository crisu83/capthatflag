define([
    'phaser'
    , 'shared/utils'
    , 'shared/component'
], function(Phaser, utils, ComponentBase) {
    'use strict';

    /**
     * Actor component class.
     * @class client.components.ActorComponent
     * @classdesc Component that adds support for a sprite to the entity.
     * @extends shared.Component
     * @property {Phaser.Sprite} sprite - Associated sprite object.
     */
    var ActorComponent = utils.inherit(ComponentBase, {
        key: 'actor'
        , phase: ComponentBase.prototype.phases.MOVEMENT
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
            // round the values to avoid sub-pixel rendering
            this.sprite.x = Math.round(x);
            this.sprite.y = Math.round(y);
        }
    });

    return ActorComponent;
});

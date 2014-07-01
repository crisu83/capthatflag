define([
    'phaser'
    , 'shared/utils'
    , 'shared/component'
], function(Phaser, utils, ComponentBase) {
    'use strict';

    /**
     * Actor component class
     * @class dungeon.components.ActorComponent
     * @extends shared.Component
     */
    var ActorComponent = utils.inherit(ComponentBase, {
        /**
         * @inheritdoc
         */
        key: 'actor'
        /**
         * @inheritdoc
         */
        , phase: ComponentBase.prototype.phases.MOVEMENT
        /**
         * Sprite object associated with this component.
         * @type {Phaser.Sprite}
         */
        , sprite: null
        /**
         * Creates a new component.
         * @param {Phaser.Sprite} sprite sprite instance
         * @constructor
         */
        , constructor: function(sprite) {
            this.sprite = sprite;
        }
        /**
         * @inheritdoc
         */
        , init: function() {
            // bind event handlers
            this.owner.on('entity.sync', this.onEntitySync.bind(this));
            this.owner.on('entity.die', this.onEntityDeath.bind(this));
        }
        /**
         * Event handler for when the entity is synchronized
         * @param {object} state synchronized entity state
         */
        , onEntitySync: function(state) {
            this.setPosition(state.x, state.y);
        }
        /**
         * Event handler for when the entity dies
         */
        , onEntityDeath: function() {
            this.sprite.kill();
        }
        /**
         * Sets the position for the associated sprite.
         * @param {number} x coordinates on the x-axis
         * @param {number} y coordinates on the y-axis
         */
        , setPosition: function(x, y) {
            // round the values to avoid sub-pixel rendering
            this.sprite.x = Math.round(x);
            this.sprite.y = Math.round(y);
        }
    });

    return ActorComponent;
});

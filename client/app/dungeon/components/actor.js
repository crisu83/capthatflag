define([
    'phaser'
    , 'shared/utils'
    , 'shared/component'
], function(Phaser, utils, ComponentBase) {
    'use strict';

    // actor component class
    var ActorComponent = utils.inherit(ComponentBase, {
        key: 'actor'
        , phase: ComponentBase.prototype.phases.MOVEMENT
        , sprite: null
        // constructor
        , constructor: function(sprite) {
            this.sprite = sprite;
        }
        // initializes this component
        , init: function() {
            // bind event handlers
            this.owner.on('entity.sync', this.onEntitySync.bind(this));
            this.owner.on('entity.recon', this.onEntityRecon.bind(this));
            this.owner.on('entity.die', this.onEntityDeath.bind(this));
        }
        // event handler for when the entity is synchronized
        , onEntitySync: function(state) {
            this.setPosition(state.x, state.y);
        }
        // event handler for when the entity is synchronized
        , onEntityRecon: function(state) {
            this.setPosition(state.x, state.y);
        }
        // event handler for when the entity dies
        , onEntityDeath: function() {
            this.sprite.kill();
        }
        // sets the position for this sprite
        , setPosition: function(x, y) {
            // round the values to avoid sub-pixel rendering
            this.sprite.x = Math.round(x);
            this.sprite.y = Math.round(y);
        }
        // sets the velocity for this sprite, assuming that its body is enabled
        , setVelocity: function(vx, vy) {
            if (this.sprite.body) {
                this.sprite.body.velocity.x = vx;
                this.sprite.body.velocity.y = vy;
            }
        }
    });

    return ActorComponent;
});

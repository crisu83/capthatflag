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
            // bind event listeners
            this.owner.on('entity.sync', this.onEntitySync.bind(this));
            this.owner.on('entity.die', this.onEntityDie.bind(this));
        }
        // event handler for when the entity is synchronized
        , onEntitySync: function(entityState) {
            this.setPosition(entityState.x, entityState.y);
        }
        // event handler for when the entity dies
        , onEntityDie: function() {
            this.sprite.kill();
        }
        // returns whether the associated sprite is moving
        , isMoving: function() {
            return this.sprite.body && (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0);
        }
        // sets the position for this sprite
        , setPosition: function(x, y) {
            this.sprite.x = x;
            this.sprite.y = y;
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

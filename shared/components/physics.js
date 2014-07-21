'use strict';

var utils = require('../utils')
    , ComponentBase = require('../core/component')
    , PhysicsComponent;

PhysicsComponent = utils.inherit(ComponentBase, {
    key: 'physics'
    , phase: ComponentBase.prototype.phases.PHYSICS
    , body: null
    , constructor: function(body) {
        this.body = body;
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
        var position = this.owner.attrs.get(['x', 'y']);

        this.body.x = position.x;
        this.body.y = position.y;
        //this.owner.attrs.set({x: this.body.position[0], y: this.body.position[1]});
    }
    /**
     * Event handler for when the entity dies.
     * @method client.components.ActorComponent#onEntityDeath
     */
    , onEntityDeath: function() {
        this.body = null;
    }
});

module.exports = PhysicsComponent;

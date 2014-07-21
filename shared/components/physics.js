'use strict';

var utils = require('../utils')
    , ComponentBase = require('../core/component')
    , PhysicsComponent;

/**
 * Physics component class.
 * @class shared.components.PhysicsComponent
 * @classdesc Component that adds physics functionality.
 * @extends shared.core.Component
 */
PhysicsComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {shared.physics.Body} body - Physical body instance.
     */
    constructor: function(body) {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'physics';
        this.phase = ComponentBase.prototype.phases.PHYSICS;

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
     * @method shared.components.PhysicsComponent#onEntityDeath
     */
    , onEntityDeath: function() {
        this.body = null;
    }
});

module.exports = PhysicsComponent;

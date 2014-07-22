'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , PhysicsComponent;

/**
 * Physics component class.
 * @class server.components.AttackComponent
 * @classdesc Component that adds physics functionality.
 * @extends shared.core.Component
 */
PhysicsComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {shared.physics.Body} body - Physical body.
     * @param {shared.physics.World} world - Phsysical world.
     */
    constructor: function(body, world) {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'physics';
        this.phase = ComponentBase.prototype.phases.PHYSICS;

        this.world = world;
        this.body = body;

        this.world.add(this.body);
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        var position = this.owner.attrs.get(['x', 'y'])
            , dimensions = this.owner.attrs.get(['width', 'height']);

        this.body.x = position.x;
        this.body.y = position.y;
        this.body.width = dimensions.width;
        this.body.height = dimensions.height;
    }
    , collide: function(type, callback, scope, body) {
        body = body || this.body;
        this.world.collide(body, type, callback, scope);
    }
    , overlap: function(type, callback, scope, body) {
        body = body || this.body;
        this.world.overlap(body, type, callback, scope);
    }
});

module.exports = PhysicsComponent;

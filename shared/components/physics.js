'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../core/component')
    , PhysicsComponent;

/**
 * Physics component class.
 * @class server.components.PhysicsComponent
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

        // internal variables
        this._world = world;
        this._body = body;
    }
    /**
     * @override
     */
    , init: function() {
        this._world.add(this._body);
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        var position = this.owner.attrs.get(['x', 'y'])
            , dimensions = this.owner.attrs.get(['width', 'height'])
            , right = position.x + dimensions.width
            , bottom = position.y + dimensions.height
            , worldRight = this._world.right()
            , worldBottom = this._world.bottom();

        if (position.x < this._world.x) {
            position.x = this._world.x;
        } else if (right > worldRight) {
            position.x = worldRight - dimensions.width;
        }
        if (position.y < this._world.y) {
            position.y = this._world.y;
        } else if (bottom > worldBottom) {
            position.y = worldBottom - dimensions.height;
        }

        this._body.x = position.x;
        this._body.y = position.y;
        this._body.width = dimensions.width;
        this._body.height = dimensions.height;

        this.owner.attrs.set({x: position.x, y: position.y});
    }
    /**
     * Checks for a collision between physical bodies.
     * @method server.components.PhysicsComponent#collide
     * @param {string} type - Body type.
     * @param {function} callback - Collision callback.
     * @param {object} scope - Collision scope.
     * @param {shared.physics.Body} body - Body instance.
     */
    , collide: function(type, callback, scope, body) {
        body = body || this._body;
        this._world.collide(body, type, callback, scope);
    }
    /**
     * Checks for an overlap between physical bodies.
     * @method server.components.PhysicsComponent#overlap
     * @param {string} type - Body type.
     * @param {function} callback - Collision callback.
     * @param {object} scope - Collision scope.
     * @param {shared.physics.Body} body - Body instance.
     */
    , overlap: function(type, callback, scope, body) {
        body = body || this._body;
        this._world.overlap(body, type, callback, scope);
    }
});

module.exports = PhysicsComponent;

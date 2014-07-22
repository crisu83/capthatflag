'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , List = require('../utils/list')
    , World;

/**
 * World class
 * @class shared.physics.World
 * @class Represents the physical world.
 */
World = utils.inherit(null, {
    /**
     * Creates a new world.
     * @constructor
     */
    constructor: function() {
        this._bodies = new List();
    }
    /**
     * Adds a body to the world.
     * @method shared.physics.World#add
     * @param {shared.physics.Body} body - Body instance.
     */
    , add: function(body) {
        body.on('body.remove', this.onBodyRemove.bind(this));
        this._bodies.add(body);
    }
    /**
     * Event handler for removing a body.
     * @method shared.physics.World#onBodyRemove
     * @param {shared.physics.Body} body - Body instance.
     */
    , onBodyRemove: function(body) {
        this._bodies.remove(body);
    }
    /**
     * Checks for a collision between the given body and other bodies.
     * @method shared.physics.World#collide
     * @param {shared.physics.Body} body - Body instance.
     * @param {string} type - Body type.
     * @param {function} callback - Collision callback.
     * @param {object} scope - Collision scope.
     */
    , collide: function(body, type, callback, scope) {
        scope = scope || callback;

        var targets = this.findTargets(body, type);

        _.each(targets, function(other) {
            this.handleCollision(body, other, callback, scope);
        }, this);
    }
    /**
     * Internal collision handler.
     * @method shared.physics.World#handleCollision
     * @param {shared.physics.Body} body - Body instance.
     * @param {shared.physics.Body} other - Other body instance.
     * @param {function} callback - Collision callback.
     * @param {object} scope - Collision scope.
     */
    , handleCollision: function(body, other, callback, scope) {
        // seprate the bodies from each other (if necessary)
        if (this.separate(body, other)) {
            callback.call(scope, body, other);
        }
    }
    /**
     * Checks for an overlap between the given body and other bodies.
     * @method shared.physics.World#overlap
     * @param {shared.physics.Body} body - Body instance.
     * @param {string} type - Body type.
     * @param {function} callback - Collision callback.
     * @param {object} scope - Collision scope.
     */
    , overlap: function(body, type, callback, scope) {
        scope = scope || callback;

        var targets = this.findTargets(body, type);

        _.each(targets, function(other) {
            this.handleOverlap(body, other, callback, scope);
        }, this);
    }
    /**
      * Internal overlap handler.
      * @method shared.physics.World#handleOverlap
      * @param {shared.physics.Body} body - Body instance.
      * @param {shared.physics.Body} other - Other body instance.
      * @param {function} callback - Collision callback.
      * @param {object} scope - Collision scope.
      */
    , handleOverlap: function(body, other, callback, scope) {
        // make sure that the bodies intersect
        if (this.intersects(body, other)) {
            callback.call(scope, body, other);
        }
    }
    /**
     * Returns all bodies of the given type.
     * @method shared.physics.World#findTargets
     * @param {shared.physics.Body} body - Body to find targets for.
     * @param {string} type - Body type.
     * @return {array} List of target bodies.
     */
    , findTargets: function(body, type) {
        var targets = [];
        this._bodies.each(function(other) {
            if (other.id !== body.id && other.type === type) {
                targets.push(other);
            }
        });
        return targets;
    }
    /**
     * Separates two bodies from each other.
     * @method shared.physics.World#separate
     * @param {shared.physics.Body} body - Body instance.
     * @param {shared.physics.Body} other - Other body instance.
     * @return {boolean} Whether the bodies were separated.
     */
    , separate: function(body, other) {
        // make sure that the bodies intersect
        if (!this.intersects(body, other)) {
            return false;
        }

        return true;
    }
    /**
     * Returns whether two bodies intersect each other.
     * @method shared.physics.World#intersects
     * @param {shared.physics.Body} body - Body instance.
     * @param {shared.physics.Body} other - Other body instance.
     * @return {boolean} The result.
     */
    , intersects: function(body, other) {
        if (body.right() <= other.x) {
            return false;
        }
        if (body.bottom() <= other.y) {
            return false;
        }
        if (body.x >= other.right()) {
            return false;
        }
        if (body.y >= other.bottom()) {
            return false;
        }
        return true;
    }
});

module.exports = World;

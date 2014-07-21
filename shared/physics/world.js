'use strict';

var utils = require('../utils')
    , World;

/**
 * TODO
 * @class shared.physics.World
 */
World = utils.inherit(null, {
    /**
     * TODO
     * @method shared.physics.World#collide
     */
    collide: function(body, other, callback, scope) {
        scope = scope || callback;
        this.handleCollision(body, other, callback, scope);
    }
    /**
     * TODO
     * @method shared.physics.World#handleCollision
     */
    , handleCollision: function(body, other, callback, scope) {
        // seprate the bodies from each other (if necessary)
        if (this.separate(body, other)) {
            callback.call(scope, body, other);
        }
    }
    /**
     * TODO
     * @method shared.physics.World#separate
     */
    , separate: function(body, other) {
        // make sure that the bodies intersect
        if (!this.intersects(body, other)) {
            return false;
        }

        return true;
    }
    /**
     * TODO
     * @method shared.physics.World#intersects
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

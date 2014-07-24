var shortid = require('shortid')
    , utils = require('../utils')
    , Node = require('../core/node')
    , Body;

/**
 * Body clas..
 * @class shared.physics.Body
 * @classdesc Represents a physical body.
 * @extends shared.core.Node
 */
Body = utils.inherit(Node, {
    /**
     * Creates a new body.
     * @constructor
     * @param {string} type - Body type.
     * @param {object} owner - Owner instance.
     */
    constructor: function(type, owner) {
        Node.apply(this);

        // inherited properties
        this.key = 'body';

        /**
         * @property {string} id - Body identifier.
         */
        this.id = shortid.generate();
        /**
         * @property {string} type - Body type.
         */
        this.type = type;
        /**
         * @property {object} owner - Body owner.
         */
        this.owner = owner;
        /**
         * @property {number} x - Body x-coordinate.
         */
        this.x = 0;
        /**
         * @property {number} y - Body y-coordinate.
         */
        this.y = 0;
        /**
         * @property {number} width - Body width.
         */
        this.width = 0;
        /**
         * @property {number} height - Body height.
         */
        this.height = 0;
    }
    /**
     * Returns the right most point of the body.
     * @method shared.physics.Body#right
     * @return {number} Value on the x-axis.
     */
    , right: function() {
        return this.x + this.width;
    }
    /**
     * Returns the bottom most point of the body.
     * @method shared.physics.Body#bottom
     * @return {number} Value on the y-axis.
     */
    , bottom: function() {
        return this.y + this.height;
    }
});

module.exports = Body;

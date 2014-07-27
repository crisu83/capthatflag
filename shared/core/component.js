'use strict';

var utils = require('../utils')
    , Node = require('./node')
    , Component;

/**
 * Component class.
 * @class shared.core.Component
 * @classdesc Base class for all entity components.
 * @extends shared.core.Node
 * @property {object} phases - Component states enumerable.
 */
Component = utils.inherit(Node, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        Node.apply(this);

        // inherited properties
        this.key = 'component';

        /**
         * @property {shared.core.Entity} owner - Entity instance.
         */
        this.owner = null;
        /**
         * @property {number} phaser - Component phase.
         */
        this.phase = null;
    }
    /**
     * Initializes the component.
     * @method shared.core.Component#init
     */
    , init: function() {

    }
    /**
     * Updates the component logic.
     * @method shared.core.Component#update
     * @param {number} elapsed - Time elapsed since the previous update (ms).
     */
    , update: function(elapsed) {

    }
    , phases: {
        INPUT: 1
        , PHYSICS: 2
        , LOGIC: 3
    }
});

module.exports = Component;

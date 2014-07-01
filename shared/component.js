'use strict';

var utils = require('./utils')
    , Node = require('./node')
    , Component;

/**
 * Component base class.
 * @class shared.Component
 * @augments shared.Node
 */
Component = utils.inherit(Node, {
    /**
     * @inheritdoc
     */
    key: 'component'
    /**
     * Entity associated with this component.
     * @type {shared.Entity}
     */
    , owner: null
    /**
     * Phase for updating this component.
     * @type {number}
     */
    , phase: null
    /**
     * Initializes this component.
     */
    , init: function() {
    }
    /**
     * Updates the logic for this component.
     * @param {number} elapsed time elapsed since the previous update (ms)
     */
    , update: function(elapsed) {
    }
    /**
     * Component states enumerable.
     * @enum {number}
     */
    , phases: {
        LOGIC: 1
        , INPUT: 2
        , MOVEMENT: 3
        , NETWORK: 4
        , PHYSICS: 5
    }
});

module.exports = Component;

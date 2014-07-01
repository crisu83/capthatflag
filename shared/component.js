'use strict';

var utils = require('./utils')
    , Node = require('./node')
    , Component;

/**
 * Component class.
 * @class shared.Component
 * @classdesc Base class for all entity components.
 * @extends shared.Node
 * @property {shared.Entity} owner - Associated entity instance.
 * @property {number} phaser - Phase for updating this component.
 * @property {object} phases - Component states enumerable.
 */
Component = utils.inherit(Node, {
    key: 'component'
    , owner: null
    , phase: null
    , phases: {
        LOGIC: 1
        , INPUT: 2
        , MOVEMENT: 3
        , NETWORK: 4
        , PHYSICS: 5
    }
    /**
     * Initializes this component.
     * @method shared.Component#init
     */
    , init: function() {
    }
    /**
     * Updates the logic for this component.
     * @method shared.Component#update
     * @param {number} elapsed - Time elapsed since the previous update (ms).
     */
    , update: function(elapsed) {
    }
});

module.exports = Component;

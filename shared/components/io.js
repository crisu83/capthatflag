'use strict';

var utils = require('../utils')
    , ComponentBase = require('../core/component')
    , IoComponent;

/**
 * IO component.
 * @class shared.components.IoComponent
 * @classdesc Component that add socket functionality.
 * @extends shared.core.Component
 */
IoComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {Primus.Spark} spark - Spark instance-
     */
    constructor: function(spark) {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'io';
        this.phase = ComponentBase.prototype.phases.NETWORK;

        /**
         * @property {Primus.Spark} spark - Spark instance.
         */
        this.spark = spark;
    }
});

module.exports = IoComponent;

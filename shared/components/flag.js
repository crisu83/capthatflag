'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../core/component')
    , FlagComponent;

/**
 * Flag component class.
 * @class shared.components.FlagComponent
 * @classdesc Component that adds flag functionality.
 * @extends shared.core.Component
 */
FlagComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'flag';
        this.phase = ComponentBase.prototype.phases.LOGIC;
    }
});

module.exports = FlagComponent;

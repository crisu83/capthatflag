'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../core/component')
    , PlayerComponent;

/**
 * Player component class.
 * @class shared.components.PlayerComponent
 * @classdesc Component that adds player functionality.
 * @extends shared.core.Component
 */
PlayerComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'player';
        this.phase = ComponentBase.prototype.phases.LOGIC;
    }
});

module.exports = PlayerComponent;

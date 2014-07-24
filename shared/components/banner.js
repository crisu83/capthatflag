'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../core/component')
    , BannerComponent;

/**
 * Banner component class.
 * @class shared.components.BannerComponent
 * @classdesc Component that adds banner functionality.
 * @extends shared.core.Component
 */
BannerComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'banner';
        this.phase = ComponentBase.prototype.phases.LOGIC;
    }
});

module.exports = BannerComponent;

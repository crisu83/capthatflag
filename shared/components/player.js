'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../component')
    , PlayerComponent;

/**
 * Shared player component class.
 * @class shared.components.PlayerComponent
 * @classdesc Base class for both server and client-side player components.
 * @extends shared.components.PlayerComponent
 */
PlayerComponent = utils.inherit(ComponentBase, {
    key: 'player'
    , phase: ComponentBase.prototype.phases.LOGIC
    /**
     * Simulates the given input.
     * @method shared.components.PlayerComponent
     * @param {object} input - Input object literal.
     * @param {object} attrs - Optional attributes.
     * @return {object} Resulting attributes.
     */
    , simulateInput: function(input, attrs) {
        attrs = attrs || this.owner.attrs.get();

        if (input.down && input.elapsed && input.speed) {
            var step = (input.elapsed / 1000) * input.speed;

            for (var i = 0; i < input.down.length; i++) {
                if (input.down[i] === 'up') {
                    attrs.y -= step;
                } else if (input.down[i] === 'down') {
                    attrs.y += step;
                }
                if (input.down[i] === 'left') {
                    attrs.x -= step;
                } else if (input.down[i] === 'right') {
                    attrs.x += step;
                }
            }
        }

        return attrs;
    }
});

module.exports = PlayerComponent;

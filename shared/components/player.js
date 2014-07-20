'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../core/component')
    , List = require('../utils/list')
    , PlayerComponent;

/**
 * Shared player component class.
 * @class shared.components.PlayerComponent
 * @classdesc Base class for both server and client-side player components.
 * @extends shared.Component
 */
PlayerComponent = utils.inherit(ComponentBase, {
    key: 'player'
    , phase: ComponentBase.prototype.phases.LOGIC
    /**
     * Applies to user command on the given attributes.
     * @method shared.components.PlayerComponent#applyCommand
     * @param {object} command - User command.
     * @param {object|null} attrs - Player attributes, defaults to current attributes.
     * @return {object} Resulting attributes.
     */
    , applyCommand: function(command, attrs) {
        attrs = attrs || this.owner.attrs.get();
        attrs.inputSequence = command.sequence;

        var step = command.speed * command.elapsed
            , down = new List(command.down);

        down.each(function(key) {
            switch (key) {
                case 'up':
                    attrs.y -= step;
                    break;
                case 'down':
                    attrs.y += step;
                    break;
                case 'left':
                    attrs.x -= step;
                    break;
                case 'right':
                    attrs.x += step;
                    break;
                default:
                    // do nothing ...
            }
        }, this);

        return attrs;
    }
});

module.exports = PlayerComponent;

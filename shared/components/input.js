'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../core/component')
    , List = require('../utils/list')
    , InputComponent;

/**
 * Shared input component class.
 * @class shared.components.InputComponent
 * @classdesc Base class for both server and client-side input components.
 * @extends shared.Component
 */
InputComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'input';
        this.phase = ComponentBase.prototype.phases.LOGIC;
    }
    /**
     * Processes to user command on the given attributes.
     * @method shared.components.InputComponent#processCommand
     * @param {object} command - User command.
     * @param {object|null} attrs - Player attributes, defaults to current attributes.
     * @return {object} Resulting attributes.
     */
    , processCommand: function(command, attrs) {
        attrs = attrs || this.owner.attrs.get();
        attrs.inputSequence = command.sequence;
        attrs.direction = command.direction;
        attrs.action = command.action;

        var step = attrs.runSpeed / 100
            , arrows = new List(command.arrows);

        arrows.each(function(key) {
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
                    break;
            }
        }, this);

        return attrs;
    }
});

module.exports = InputComponent;

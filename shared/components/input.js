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
        this.phase = ComponentBase.prototype.phases.INPUT;
    }
    /**
     * Processes to user command on the given attributes.
     * @method shared.components.InputComponent#processCommand
     * @param {object} command - User command.
     * @param {object|null} attrs - Player attributes, defaults to current attributes.
     * @return {object} Resulting attributes.
     */
    , processCommand: function(command, attrs) {
        // TODO clean up the code in this method
        attrs = attrs || this.owner.attrs.get();
        attrs.inputSequence = command.sequence;
        attrs.actions = [];
        attrs.facing = 'none';

        var step = attrs.runSpeed / 100
            , keys = new List(command.keys)
            , arrows = new List();

        keys.each(function(key) {
            if (key.indexOf('arrow') !== -1) {
                arrows.add(key);
            } else if (key === 'space') {
                attrs.actions.push('attack');
            }
        }, this);

        // compensate step size for diagonal movement (Pythagora's theorem)
        if (arrows.size() > 1) {
            step /= Math.sqrt(2);
        }

        if (!arrows.isEmpty()) {
            arrows.each(function(arrow) {
                switch (arrow) {
                    case 'arrowUp':
                        attrs.y -= step;
                        attrs.facing = 'up';
                        break;
                    case 'arrowDown':
                        attrs.y += step;
                        attrs.facing = 'down';
                        break;
                    case 'arrowLeft':
                        attrs.x -= step;
                        attrs.facing = 'left';
                        break;
                    case 'arrowRight':
                        attrs.x += step;
                        attrs.facing = 'right';
                        break;
                    default:
                        break;
                }
            }, this);

            // round the values for
            attrs.x = Math.round(attrs.x);
            attrs.y = Math.round(attrs.y);

            attrs.actions.push('run');
        }

        return attrs;
    }
});

module.exports = InputComponent;

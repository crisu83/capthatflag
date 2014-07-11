'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ComponentBase = require('../component')
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
     * Processes multiple user commands on the associated entity.
     * @method shared.components.PlayerComponent#processCommands
     * @param {array} commands - List of user commands.
     * @return {object} Resulting attributes.
     */
    , processCommands: function(commands) {
        var attrs = this.owner.attrs.get()
            , command;

        for (var i = 0; i < commands.length; i++) {
            attrs = this.applyCommand(commands[i], attrs);
        }

        return attrs;
    }
    /**
     * Applies to user command on the given attributes.
     * @method shared.components.PlayerComponent#applyCommand
     * @param {object} command - User command.
     * @param {object|null} attrs - Player attributes, defaults to current attributes.
     * @return {object} Resulting attributes.
     */
    , applyCommand: function(command, attrs) {
        attrs = attrs || this.owner.attrs.get();

        if (command.down && command.elapsed && command.speed) {
            var step = (command.elapsed / 1000) * command.speed;

            for (var i = 0; i < command.down.length; i++) {
                if (command.down[i] === 'up') {
                    attrs.y -= step;
                } else if (command.down[i] === 'down') {
                    attrs.y += step;
                }
                if (command.down[i] === 'left') {
                    attrs.x -= step;
                } else if (command.down[i] === 'right') {
                    attrs.x += step;
                }
            }
        }

        return attrs;
    }
});

module.exports = PlayerComponent;

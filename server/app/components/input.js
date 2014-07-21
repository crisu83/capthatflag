'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/input')
    , InputComponent;

/**
 * Input component class.
 * @class server.components.InputComponent
 * @classdesc Server-side component that adds support for receiving user commands.
 * @extends shared.components.InputComponent
 */
InputComponent = utils.inherit(ComponentBase, {
    /**
     * @override
     */
    init: function() {
        this.owner.socket.on('player.input', this.onInput.bind(this));
    }
    /**
     * Event handler for when receiving user input.
     * @method server.components.InputComponent#onCommand
     * @param {object} command - User command.
     */
    , onInput: function(commands) {
        var attrs = this.owner.attrs.get();

        for (var i = 0; i < commands.length; i++) {
            attrs = this.applyCommand(commands[i], attrs);
        }

        this.owner.attrs.set(attrs);
    }
});

module.exports = InputComponent;

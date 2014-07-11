'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/player')
    , PlayerComponent;

/**
 * Player component class.
 * @class server.components.PlayerComponent
 * @classdesc Server-side component that adds support for receiving user commands.
 * @extends shared.components.PlayerComponent
 */
PlayerComponent = utils.inherit(ComponentBase, {
    /**
     * @override
     */
    init: function() {
        this.owner.socket.on('player.input', this.onInput.bind(this));
    }
    /**
     * Event handler for when receiving user input.
     * @method server.components.PlayerComponent#onCommand
     * @param {object} command - User command.
     */
    , onInput: function(commands) {
        var attrs = this.processCommands(commands);
        this.owner.attrs.set(attrs);
    }
});

module.exports = PlayerComponent;

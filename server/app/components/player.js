'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/player')
    , PlayerComponent;

/**
 * Player component class.
 * @class client.components.PlayerComponent
 * @classdesc Server-side component that adds support for receiving user input.
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
     * Event handler for when receiving player input.
     * @method server.components.PlayerComponent#onInput
     * @param {object} input - Input object literal.
     */
    , onInput: function(input) {
        // simulate the input the input to calculate the real position,
        // set the entity attributes and take a snapshot of the state
        var attrs = this.simulateInput(input);
        attrs.inputSequence = input.sequence;
        this.owner.attrs.set(attrs);
    }
});

module.exports = PlayerComponent;

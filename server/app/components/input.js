'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/input')
    , InputComponent;

/**
 * Input component class.
 * @class server.components.InputComponent
 * @classdesc Component that adds functionality for processing of user input.
 * @extends shared.components.InputComponent
 */
InputComponent = utils.inherit(ComponentBase, {
    /**
     * @override
     */
    init: function() {
        var io = this.owner.components.get('io');
        io.spark.on('player.input', this.onInput.bind(this));
    }
    /**
     * Event handler for when receiving user input.
     * @method server.components.InputComponent#onCommand
     * @param {object} command - User command.
     */
    , onInput: function(command) {
        var attrs = this.processCommand(command);
        this.owner.attrs.set(attrs);
    }
});

module.exports = InputComponent;

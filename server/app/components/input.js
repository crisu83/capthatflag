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
     * Create a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // internal properties
        this._lastDirection = 'none';
        this._lastInputAt = null;
    }
    /**
     * @override
     */
    , init: function() {
        var io = this.owner.components.get('io');
        io.spark.on('player.input', this.onInput.bind(this));
    }
    /**
     * Event handler for when receiving user input.
     * @method server.components.InputComponent#onCommand
     * @param {object} command - User command.
     */
    , onInput: function(commands) {
        var now = _.now()
            , attrs = this.owner.attrs.get();

        for (var i = 0; i < commands.length; i++) {
            attrs = this.applyCommand(commands[i], attrs);
        }

        this.owner.attrs.set(attrs);

        this._lastDirection = attrs.direction;
        this._lastInputAt = now;
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        var now = _.now();

        if (this._lastDirection !== 'none' && this._lastInputAt && (now - this._lastInputAt) > 200) {
            this.owner.attrs.set('direction', 'none');
        }
    }
});

module.exports = InputComponent;

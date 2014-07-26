'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/input')
    , List = require('../../../shared/utils/list')
    , InputComponent;

/**
 * Input component class.
 * @class client.components.InputComponent
 * @classdesc Component that adds functionality for processing of user input.
 * @extends shared.components.InputComponent
 */
InputComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {Phaser.Input} input - Input manager.
     */
    constructor: function(input) {
        ComponentBase.apply(this);

        // internal properties
        this._input = input;
        this._io = null;
        this._cursorKeys = null;
        this._attackKey = null;
        this._commands = new List();
        this._sequence = 0;
        this._lastDirection = 'none';
        this._lastAction = 'none';
        this._lastSyncAt = null;
    }
    /**
     * @override
     */
    , init: function() {
        this._input.reset(true/* hard */);

        this._io = this.owner.components.get('io');
        this._cursorKeys = this._input.keyboard.createCursorKeys();
        this._attackKey = this._input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.owner.on('entity.sync', this.onEntitySync.bind(this));
    }
    /**
     * Event handler for when the associated entity is synchronized.
     * @method client.components.InputComponent#onEntitySync
     * @param {object} attrs - Synchronized attributes.
     */
    , onEntitySync: function(attrs) {
        if (_.has(attrs, 'inputSequence')) {
            this._commands.filter(function(command) {
                return command.sequence > attrs.inputSequence;
            }, true/* replace */);

            this._commands.each(function(command) {
                attrs = this.processCommand(command, attrs);
            }, this);

            attrs = _.omit(attrs, 'inputSequence');
        }

        this.owner.attrs.set(attrs);
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.captureInput(elapsed);
    }
    /**
     * Captures input from the player.
     * @method client.components.PlayerComponent#captureInput
     * @param {number} elasped - Time elapsed since the logic was last updated.
     */
    , captureInput: function(elapsed) {
        var now = _.now()
            , alive = this.owner.attrs.get('alive')
            , command = {sequence: null, arrows: [], direction: 'none', action: 'none'};

        // only take input from alive entities
        if (_.isUndefined(alive) || alive === true) {
            // check if arrow keys are pressed
            if (this._cursorKeys.up.isDown) {
                command.arrows.push('up');
            } else if (this._cursorKeys.down.isDown) {
                command.arrows.push('down');
            }
            if (this._cursorKeys.left.isDown) {
                command.arrows.push('left');
            } else if (this._cursorKeys.right.isDown) {
                command.arrows.push('right');
            }

            // check if the attack key is pressed
            if (this._attackKey.isDown) {
                command.action = 'attack';
            }

            // last arrow key determines the direction that entity will be facing
            if (command.arrows.length) {
                command.direction = command.arrows[command.arrows.length - 1];
            }

            // send the user commands with 10 ms interval
            // in order to prevent unnecessary network traffic.
            if (_.isUndefined(this._lastSyncAt) || (now - this._lastSyncAt) > 10) {
                // check if any input was actually received.
                if (command.arrows.length || command.direction !== this._lastDirection || command.action !== this._lastAction) {
                    command.sequence = this._sequence++;
                    this._commands.add(command);

                    if (this.owner.config.enablePrediction) {
                        var attrs = this.processCommand(command);
                        this.owner.attrs.set(attrs);
                    }

                    this._io.spark.emit('player.input', command);

                    this._lastDirection = command.direction;
                    this._lastAction = command.action;
                }

                this._lastSyncAt = now;
            }
        }
    }
});

module.exports = InputComponent;

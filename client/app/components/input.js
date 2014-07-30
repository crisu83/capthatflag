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
        this._lastInputSequence = -1;
        this._lastDirection = 'none';
        this._lastAction = 'none';
        this._lastSyncAt = null;
    }
    /**
     * @override
     */
    , init: function() {
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
        // check that we do not process the same input multiple times
        if (_.has(attrs, 'inputSequence') && attrs.inputSequence > this._lastInputSequence) {
            // remove all commands that are older than the that was received from the server
            this._commands.filter(function(command) {
                return command.sequence > attrs.inputSequence;
            }, true);

            // process all the commands that has not yet been processed on the server
            this._commands.each(function(command) {
                attrs = this.processCommand(command, attrs);
            }, this);

            this._lastInputSequence = attrs.inputSequence;
        } else {
            // if we are not processing input we must omit the position
            // to avoid updating an outdated position to the client
            attrs = _.omit(attrs, ['x', 'y']);
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
            , command = {sequence: null, keys: []};

        // only take input from alive entities
        if (_.isUndefined(alive) || alive === true) {
            // check if arrow keys are pressed
            if (this._cursorKeys.up.isDown) {
                command.keys.push('arrowUp');
            } else if (this._cursorKeys.down.isDown) {
                command.keys.push('arrowDown');
            }
            if (this._cursorKeys.left.isDown) {
                command.keys.push('arrowLeft');
            } else if (this._cursorKeys.right.isDown) {
                command.keys.push('arrowRight');
            }

            // check if the attack key is pressed
            if (this._attackKey.isDown) {
                command.keys.push('space');
            }

            // send the user commands with 10 ms interval
            // in order to prevent unnecessary network traffic.
            if (_.isUndefined(this._lastSyncAt) || (now - this._lastSyncAt) > 10) {
                // add the command to the command history
                command.sequence = this._sequence++;
                this._commands.add(command);

                // apply input prediction
                this.owner.attrs.set(this.processCommand(command));

                // send the input to the server
                this._io.spark.emit('player.input', command);

                this._lastSyncAt = now;
            }
        }
    }
});

module.exports = InputComponent;

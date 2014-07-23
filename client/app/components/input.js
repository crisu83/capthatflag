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
        this._commands = new List();
        this._processed = [];
        this._sequence = 0;
        this._lastDirection = 'none';
        this._lastSyncAt = null;
    }
    /**
     * @override
     */
    , init: function() {
        this._io = this.owner.components.get('io');
        this._cursorKeys = this._input.keyboard.createCursorKeys();

        this.owner.on('entity.sync', this.onEntitySync.bind(this));
    }
    /**
     * Event handler for when the associated entity is synchronized.
     * @method client.components.InputComponent#onEntitySync
     * @param {object} attrs - Synchronized attributes.
     */
    , onEntitySync: function(attrs) {
        var inputSequence = attrs.inputSequence;
        delete attrs.inputSequence;

        if (!this.inputProcessed(inputSequence)) {
            this._commands.filter(function(command) {
                return command.sequence > attrs.inputSequence;
            });

            this._commands.each(function(command) {
                attrs = this.processCommand(command, attrs);
            }, this);

            this._processed.push(attrs.inputSequence);
        } else if (attrs.alive) {
            //attrs = _.omit(attrs, ['x', 'y', 'direction']);
        }

        this.owner.attrs.set(attrs);
    }
    /**
     * Returns whether the given attributes have already been processed.
     * @method client.components.InputComponent#inputProcessed
     * @param {number} sequence - Input sequence.
     * @return {boolean} The result.
     */
    , inputProcessed: function(sequence) {
        return this._processed.indexOf(sequence) !== -1;
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
            , command;

        this._lastSyncAt = this._lastSyncAt || now;

        command = {
            sequence: null
            , down: []
            , direction: 'none'
            , elapsed: elapsed
            , processed: false
        };

        if (alive) {
            if (this._cursorKeys.up.isDown) {
                command.down.push('up');
            } else if (this._cursorKeys.down.isDown) {
                command.down.push('down');
            }
            if (this._cursorKeys.left.isDown) {
                command.down.push('left');
            } else if (this._cursorKeys.right.isDown) {
                command.down.push('right');
            }

            if (command.down.length) {
                command.direction = command.down[command.down.length - 1];
            }

            if (command.down.length || command.direction !== this._lastDirection) {
                command.sequence = this._sequence++;
                this._commands.add(command);

                if (this.owner.config.enablePrediction) {
                    var attrs = this.processCommand(command);
                    this.owner.attrs.set(attrs);
                }

                this._lastDirection = command.direction;
            }

            if ((now - this._lastSyncAt) > (1000 / this.owner.config.tickRate)) {
                var unprocessed = [];
                this._commands.each(function(command) {
                    if (!command.processed) {
                        unprocessed.push(command);
                        command.processed = true;
                    }
                });

                if (unprocessed.length) {
                    this._io.spark.emit('player.input', unprocessed);
                }

                this._lastSyncAt = now;
            }
        }
    }
});

module.exports = InputComponent;

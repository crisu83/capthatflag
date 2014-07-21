'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/input')
    , List = require('../../../shared/utils/list')
    , InputComponent;

/**
 * Input component class.
 * @class client.components.InputComponent
 * @classdesc Client-isde component that adds support for taking user input.
 * @extends shared.components.InputComponent
 * @property {Phaser.Input} input - Input manager instance.
 */
InputComponent = utils.inherit(ComponentBase, {
    input: null
    , _cursorKeys: null
    , _commands: null
    , _processed: null
    , _sequence: 0
    , _lastSyncAt: null
    /**
     * Creates a new component.
     * @constructor
     * @param {Phaser.Input} input - Input manager.
     */
    , constructor: function(input) {
        this.input = input;
        this._cursorKeys = input.keyboard.createCursorKeys();
        this._commands = new List();
        this._processed = [];
    }
    /**
     * @override
     */
    , init: function() {
        this.owner.on('entity.sync', this.onEntitySync.bind(this));
    }
    /**
     * Event handler for when the associated entity is synchronized.
     * @method client.components.PlayerComponent#onEntitySync
     * @param {object} attrs - Synchronized attributes.
     */
    , onEntitySync: function(attrs) {
        if (!this.isAttributesProcessed(attrs)) {
            var inputSequence = attrs.inputSequence
                , command;

            delete attrs.inputSequence;

            this._commands.filter(function(command) {
                return command.sequence > inputSequence;
            });

            this._commands.each(function(command) {
                attrs = this.applyCommand(command, attrs);
            }, this);

            this.owner.attrs.set(attrs);
            this._processed.push(inputSequence);
        }
    }
    /**
     * Returns whether the given attributes have already been processed.
     * @method client.components.PlayerComponent#isAttributesProcessed
     * @param {object} attrs - Entity attributes.
     * @return {boolean} The result.
     */
    , isAttributesProcessed: function(attrs) {
        return attrs.inputSequence && this._processed.indexOf(attrs.inputSequence) !== -1;
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        var now = +new Date()
            , speed = this.owner.attrs.get('speed')
            , command;

        this._lastSyncAt = this._lastSyncAt || now;

        command = {
            sequence: null
            , down: []
            , speed: speed
            , elapsed: elapsed
            , processed: false
        };

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
            command.sequence = this._sequence++;
            this._commands.add(command);

            if (this.owner.config.enablePrediction) {
                var attrs = this.applyCommand(command);
                this.owner.attrs.set(attrs);
            }
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
                this.owner.socket.emit('player.input', unprocessed);
            }

            this._lastSyncAt = now;
        }
    }
});

module.exports = InputComponent;

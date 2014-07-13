'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/player')
    , PlayerComponent;

/**
 * Player component class.
 * @class client.components.PlayerComponent
 * @classdesc Client-isde component that adds support for taking user input.
 * @extends shared.Component
 * @property {Phaser.Input} input - Input manager instance.
 * @property {object} - Cursor keys.
 */
PlayerComponent = utils.inherit(ComponentBase, {
    input: null
    , _cursorKeys: null
    , _commands: null
    , _sequence: 0
    , _lastSyncAt: null
    /**
     * Creates a new component.
     * @constructor
     * @param {Phaser.Input} input - Input manager.
     */
    , constructor: function(input) {
        this.input = input;
        this._cursorKeys = this.input.keyboard.createCursorKeys();
        this._commands = [];
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        ComponentBase.prototype.update.apply(this, arguments);

        var now = +new Date()
            , speed = this.owner.attrs.get('speed')
            , command = {down: [], speed: speed, elapsed: elapsed, sequence: null};

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

            if (this.owner.config.enablePrediction) {
                var attrs = this.applyCommand(command);
                this.owner.attrs.set(attrs);
            }

            this._commands.push(command);
        }

        if (this._commands.length && (!this._lastSyncAt || (now - this._lastSyncAt) > (1000 / this.owner.config.tickRate))) {
            this.owner.socket.emit('player.input', this._commands);

            this._commands = [];
            this._lastSyncAt = now;
        }
    }
});

module.exports = PlayerComponent;

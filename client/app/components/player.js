define([
    'lodash'
    , 'phaser'
    , 'shared/utils'
    , 'shared/components/player'
], function(_, Phaser, utils, ComponentBase) {
    'use strict';

    /**
     * Player component class.
     * @class client.components.PlayerComponent
     * @classdesc Client-isde component that adds support for taking user input.
     * @extends shared.Component
     * @property {Phaser.Input} input - Associated input manager instance.
     * @property {object} - Cursor keys object literal.
     */
    var PlayerComponent = utils.inherit(ComponentBase, {
        key: 'player'
        , phase: ComponentBase.prototype.phases.INPUT
        , input: null
        , cursorKeys: null
        , _sequence: 0
        , _inputs: null
        /**
         * Creates a new component.
         * @constructor
         * @param {Phaser.Input} input - Input manager.
         */
        , constructor: function(input) {
            this.input = input;
            this.cursorKeys = this.input.keyboard.createCursorKeys();
            this._inputs = [];
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
         */
        , onEntitySync: function(state) {
            var attrs = _.omit(state, ['inputSequence']);

            this._inputs = _.filter(this._inputs, function(input) {
                return input.sequence > state.inputSequence;
            });

            for (var i = 0; i < this._inputs.length; i++) {
                attrs = this.simulateInput(this._inputs[i], attrs);
            }

            this.owner.attrs.set(attrs);
        }
        /**
         * @override
         */
        , update: function(elapsed) {
            ComponentBase.prototype.update.apply(this, arguments);

            var actor = this.owner.components.get('actor');

            if (actor) {
                var speed = this.owner.attrs.get('speed')
                    , step = (elapsed / 1000) * speed
                    , input;

                // TODO consider moving speed to the server only

                input = {down: [], speed: speed, elapsed: elapsed};

                if (this.cursorKeys.up.isDown) {
                    input.down.push('up');
                } else if (this.cursorKeys.down.isDown) {
                    input.down.push('down');
                }
                if (this.cursorKeys.left.isDown) {
                    input.down.push('left');
                } else if (this.cursorKeys.right.isDown) {
                    input.down.push('right');
                }

                // move the player immediately without waiting for the response
                // from the server to avoid an unnecessary lag effect
                if (input.down.length) {
                    // TODO figure out why we cannot use x and y from attrs
                    var attrs = {x: actor.sprite.x, y: actor.sprite.y};
                    attrs = this.simulateInput(input, attrs);
                    actor.setPosition(attrs.x, attrs.y);
                    input.sequence = this._sequence++;
                    this._inputs.push(input);
                    this.owner.socket.emit('player.input', input);
                }
            }
        }
    });

    return PlayerComponent;
});

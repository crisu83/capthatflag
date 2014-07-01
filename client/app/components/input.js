define([
    'phaser'
    , 'shared/utils'
    , 'shared/component'
], function(Phaser, utils, ComponentBase) {
    'use strict';

    /**
     * Input component class.
     * @class client.components.InputComponent
     * @classdesc Component that adds support for taking user input.
     * @extends shared.Component
     * @property {Phaser.Input} - Associated input manager instance.
     * @property {object} - Cursor keys object literal.
     */
    var InputComponent = utils.inherit(ComponentBase, {
        key: 'input'
        , phase: ComponentBase.prototype.phases.INPUT
        , input: null
        , cursorKeys: null
        /**
         * Creates a new component.
         * @constructor
         * @param {Phaser.Input} input - Input manager.
         */
        , constructor: function(input) {
            this.input = input;
            this.cursorKeys = this.input.keyboard.createCursorKeys();
        }
        /**
         * @override
         */
        , update: function(elapsed) {
            ComponentBase.prototype.update.apply(this, arguments);

            var actor = this.owner.components.get('actor');
            if (actor) {
                var x = actor.sprite.x
                    , y = actor.sprite.y
                    , speed = this.owner.attrs.get('speed')
                    , step = (elapsed / 1000) * speed
                    , input = [];

                if (this.cursorKeys.up.isDown) {
                    y -= step;
                    input.push('up');
                } else if (this.cursorKeys.down.isDown) {
                    y += step;
                    input.push('down');
                }
                if (this.cursorKeys.left.isDown) {
                    x -= step;
                    input.push('left');
                } else if (this.cursorKeys.right.isDown) {
                    x += step;
                    input.push('right');
                }

                // move the player immediately without waiting for the response
                // from the server to avoid an unnecessary lag effect
                // and save the input, speed and elapsed time in the entity state
                if (input.length) {
                    actor.setPosition(x, y);
                    this.owner.state.add({input: input, speed: speed, elapsed: elapsed});
                }
            }
        }
    });

    return InputComponent;
});

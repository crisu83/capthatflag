define([
    'phaser'
    , 'shared/utils'
    , 'shared/component'
], function(Phaser, utils, ComponentBase) {
    'use strict';

    /**
     * Input component class
     * @class dungeon.components.InputComponent
     * @extends shared.Component
     */
    var InputComponent = utils.inherit(ComponentBase, {
        /**
         * @inheritdoc
         */
        key: 'input'
        /**
         * @inheritdoc
         */
        , phase: ComponentBase.prototype.phases.INPUT
        /**
         * Input manager associated with this component.
         * @type {Phaser.Input}
         */
        , input: null
        /**
         * Cursor keys object.
         * @type {object}
         */
        , cursorKeys: null
        /**
         * Creates a new component.
         * @param {Phaser.Input} input input manager
         * @constructor
         */
        , constructor: function(input) {
            this.input = input;
            this.cursorKeys = this.input.keyboard.createCursorKeys();
        }
        /**
         * @inheritdoc
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

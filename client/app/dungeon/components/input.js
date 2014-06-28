define([
    'phaser'
    , 'shared/utils'
    , 'shared/component'
], function(Phaser, utils, ComponentBase) {
    'use strict';

    // input component class
    var InputComponent = utils.inherit(ComponentBase, {
        key: 'input'
        , phase: ComponentBase.prototype.phases.INPUT
        , input: null
        , cursorKeys: null
        , sprite: null
        // consturctor
        , constructor: function(input) {
            this.input = input;
            this.cursorKeys = this.input.keyboard.createCursorKeys();
        }
        // updates the logic for this component
        , update: function(elapsed) {
            ComponentBase.prototype.update.apply(this, arguments);

            var actor = this.owner.getComponent('actor');
            if (actor) {
                var x = actor.sprite.x
                    , y = actor.sprite.y
                    , input = []
                    , step, state;

                step = (elapsed / 1000) * this.owner.getAttr('speed');

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

                // move the player immediately without waiting for the server
                // to respond in order to avoid an unnecessary lag effect
                if (input.length) {
                    actor.setPosition(x, y);
                }

                // add the direction and delta time to the entity state
                this.owner.setAttrs({input: input, elapsed: elapsed});
            }
        }
    });

    return InputComponent;
});

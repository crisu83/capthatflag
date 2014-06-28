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
        , update: function(game) {
            ComponentBase.prototype.update.apply(this, arguments);

            var actor = this.owner.getComponent('actor');
            if (actor) {
                var io = this.owner.getComponent('io')
                    , step = (game.time.elapsed * this.owner.getAttr('speed')) / 1000
                    , direction;

                if (this.cursorKeys.up.isDown) {
                    actor.sprite.y -= step;
                    direction = 'up';
                }
                if (this.cursorKeys.right.isDown) {
                    actor.sprite.x += step;
                    direction = 'right';
                }
                if (this.cursorKeys.down.isDown) {
                    actor.sprite.y += step;
                    direction = 'down';
                }
                if (this.cursorKeys.left.isDown) {
                    actor.sprite.x -= step;
                    direction = 'left';
                }

                // todo: send the input to the server
            }
        }
    });

    return InputComponent;
});

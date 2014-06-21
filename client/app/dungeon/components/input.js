define([
    'phaser'
    , 'shared/utils'
    , 'shared/component'
], function(Phaser, utils, ComponentBase) {
    // input component class
    var InputComponent = utils.inherit(ComponentBase, {
        phase: ComponentBase.prototype.phases.LOGIC
        , cursorKeys: null
        , sprite: null
        // consturctor
        , constructor: function(cursorKeys) {
            this.key = 'input';
            this.cursorKeys = cursorKeys;
        }
        // updates the logic for this component
        , update: function(game) {
            ComponentBase.prototype.update.apply(this, arguments);

            var vx = 0, vy = 0;

            if (this.cursorKeys.up.isDown) {
                vy = -this.owner.speed;
            }
            if (this.cursorKeys.right.isDown) {
                vx = this.owner.speed;
            }
            if (this.cursorKeys.down.isDown) {
                vy = this.owner.speed;
            }
            if (this.cursorKeys.left.isDown) {
                vx = -this.owner.speed;
            }

            // reset velocities when corresponding cursor keys are released
            if (this.cursorKeys.left.isUp && this.cursorKeys.right.isUp) {
                vx = 0;
            }
            if (this.cursorKeys.up.isUp && this.cursorKeys.down.isUp) {
                vy = 0;
            }

            // Note that this was too slow to do with events
            var sprite = this.owner.getComponent('sprite');
            sprite.sprite.body.velocity.x = vx;
            sprite.sprite.body.velocity.y = vy;
        }
    });

    return InputComponent;
});

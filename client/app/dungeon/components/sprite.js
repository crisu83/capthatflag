define([
    'shared/utils'
    , 'shared/component'
], function(utils, ComponentBase) {
    // sprite component class
    var SpriteComponent = utils.inherit(ComponentBase, {
        phase: ComponentBase.prototype.phases.MOVEMENT
        , sprite: null
        // constructor
        , constructor: function(sprite) {
            this.key = 'sprite';
            this.sprite = sprite;
        }
        // initializes this component
        , init: function() {
            var self = this;

            this.owner.image = this.sprite.key;
            this.updatePosition();

            // listen to the entity's die event
            this.owner.on('entity.die', function() {
                self.sprite.kill();
            });
        }
        // updates this component
        , update: function(game) {
            ComponentBase.prototype.update.apply(this, arguments);

            if (this.isMoving()) {
                this.updatePosition();

                var io = this.owner.getComponent('io');
                io.socket.emit('player.move', this.owner.toJSON());
            }
        }
        // updates the position of the associated entity
        , updatePosition: function() {
            this.owner.x = this.sprite.x;
            this.owner.y = this.sprite.y;
        }
        // returns whether the associated sprite is moving
        , isMoving: function() {
            return this.sprite.body && (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0);
        }
        // sets the position for this sprite
        , setPosition: function(x, y) {
            // round the values to avoid sub-pixel rendering
            this.sprite.x = Math.round(x);
            this.sprite.y = Math.round(y);
        }
        // sets the velocity for this sprite, assuming that its body is enabled
        , setVelocity: function(vx, vy) {
            if (this.sprite.body) {
                this.sprite.body.velocity.x = vx;
                this.sprite.body.velocity.y = vy;
            }
        }
    });

    return SpriteComponent;
});

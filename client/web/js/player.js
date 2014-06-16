'use strict';

var Player = function(x, y, image) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.clientId = null;
    this.sprite = null;
};

Player.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;

    if (this.sprite) {
        this.sprite.position.setTo(x, y);
    }
}

Player.prototype.toJSON = function() {
    return {
        x: this.x
        , y: this.y
        , image: this.image
        , clientId: this.clientId
    };
};

if (typeof module !== 'undefined') {
    module.exports = Player;
}

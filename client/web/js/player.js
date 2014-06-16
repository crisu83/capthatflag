'use strict';

var Player = function (x, y, image, id) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.id = id;
    this.sprite = null;
};

Player.prototype.toJSON = function () {
    return {
        x: this.x
        , y: this.y
        , image: this.image
        , id: this.id
    };
};

if (typeof module !== 'undefined') {
    module.exports = Player;
}

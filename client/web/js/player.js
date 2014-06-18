'use strict';

// todo: set up proper inheritance, this is just test code

// todo: move this class under shared and use Grunt to publish it for the client

// player constructor
var Player = function(x, y, image) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.clientId = null;
    this.sprite = null;
};

// converts this player's state to json
Player.prototype.toJSON = function() {
    var json = {
        x: this.x
        , y: this.y
        , image: this.image
    };

    // we only set the client id on the server
    if (this.clientId) {
        json.clientId = this.clientId;
    }

    return json;
};

// sets this player's state from json
Player.prototype.fromJSON = function(json) {
    this.x = Math.round(json.x);
    this.y = Math.round(json.y);
    this.image = json.image;
}

// todo: use glue.js to package CommonJS modules for the browser
if (typeof module !== 'undefined') {
    module.exports = Player;
}

'use strict';

var utils = require('../../shared/utils')
    , Room = require('./room');

/**
 * Runs the game.
 * @param {primus.Server} io - Primus server instance.
 */
function run(primus) {

    // TODO: add support for different rooms

    var room = new Room(primus);
    room.init();
}

module.exports = {
    run: run
};

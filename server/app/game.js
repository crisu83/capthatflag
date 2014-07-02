'use strict';

var utils = require('../../shared/utils')
    , Room = require('./room');

/**
 * Runs the game.
 * @param {socketio.Server} io - Socket server instance.
 */
function run(io) {

    // todo: add support for different rooms

    var room = new Room(io);
    room.init();
}

module.exports = {
    run: run
};

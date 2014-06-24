'use strict';

var utils = require('../../../shared/utils')
    , Room = require('./rooms/dungeon');

function run(io) {
    // todo: add support for different rooms

    var room = new Room(io);
    room.init();
}

module.exports = {
    run: run
};

'use strict';

var utils = require('../../../../shared/utils')
    , Room = require('../../room');

var DungeonRoom = utils.inherit(Room, {
    mapKey: 'dungeon'
    , mapData: require('../../../assets/tilemaps/dungeon.json')
    , mapImage: 'dungeon'
    , mapSrc: 'assets/images/tilemaps/dungeon.png'
    , mapLayer: 'Floor1'
});

module.exports = DungeonRoom;

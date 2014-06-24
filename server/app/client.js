'use strict';

var utils = require('../../shared/utils')
    , shortid = require('shortid')
    , Phaser = require('./phaser')
    , Player = require('./dungeon/objects/player')
    , config = require('./config.json');

var Client = utils.inherit(null, {
    id: null
    , socket: null
    , room: null
    , player: null
    // constructor
    , constructor: function(id, socket, room) {
        this.id = id;
        this.socket = socket;
        this.room = room;

        console.log('  client %s created for room %s', this.id, this.room.id);
    }
    // initializes this client
    , init: function() {
        // create a socket for this room and join it
        this.socket.join(this.room.id);

        // let the client know to which room they have connected
        this.socket.emit('client.joinRoom', this.room.id);

        console.log('  client %s connected to room %s', this.id, this.room.id);

        // send the configuration to the client
        this.socket.emit('client.init', {
            id: this.id
            , canvasWidth: config.canvasWidth
            , canvasHeight: config.canvasHeight
            , gameWidth: config.gameWidth
            , gameHeight: config.gameHeight
            , mapKey: this.room.mapKey
            , mapData: JSON.stringify(this.room.mapData)
            , mapType: Phaser.Tilemap.TILED_JSON
            , mapImage: this.room.mapImage
            , mapSrc: this.room.mapSrc
            , mapLayer: this.room.mapLayer
        });

        // event handler for when the client is ready
        this.socket.on('client.ready', this.onReady.bind(this));

        // event handler for when the client is disconnected from the server
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    }
    , onReady: function() {
        var entityStates = [];
        for (var id in this.room.entities) {
            if (this.room.entities.hasOwnProperty(id)) {
                entityStates.push(this.room.entities[id].toJSON());
            }
        }
        this.socket.emit('client.entitySpawn', entityStates);

        this.player = new Player();
        this.player.x = this.room.game.world.randomX;
        this.player.y = this.room.game.world.randomY;
        this.player.image = 'male';
        this.player.clientId = this.id;

        this.room.entities[this.player.id] = this.player;

        this.socket.emit('client.playerCreate', this.player.toJSON());

        this.socket.broadcast.emit('client.playerJoin', this.player.toJSON());

        this.socket.on('client.entityMove', this.onEntityMove.bind(this));
    }
    , onEntityMove: function(entityState) {
        this.socket.broadcast.emit('client.entityMove', entityState);
    }
    , onDisconnect: function() {
        var player = this.room.entities[this.player.id];
        delete this.room.entities[this.player.id];
        player.die();

        // let other clients know that this client has left the room
        this.socket.broadcast.emit('client.playerLeave', this.player.id);

        console.log('  client %s disconnected from room %s', this.id, this.room.id);
    }
});

module.exports = Client;

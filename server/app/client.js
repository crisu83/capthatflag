'use strict';

var utils = require('../../shared/utils')
    , shortid = require('shortid')
    , EntityFactory = require('./entityFactory')
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
            // client identifier
            id: this.id
            // game configuration
            , canvasWidth: config.canvasWidth
            , canvasHeight: config.canvasHeight
            , gameWidth: config.gameWidth
            , gameHeight: config.gameHeight
            // map configuration
            , mapKey: this.room.tilemap.key
            , mapData: JSON.stringify(require(this.room.tilemap.data))
            , mapType: this.room.tilemap.type
            , mapImage: this.room.tilemap.image
            , mapSrc: this.room.tilemap.src
            , mapLayer: this.room.tilemap.layers[0]
        });

        // bind event handlers
        this.socket.on('client.ready', this.onReady.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    }
    , onReady: function() {
        var player = EntityFactory.create('player');

        player.setAttrs({
            id: shortid.generate()
            , clientId: this.id
            , x: Math.abs(Math.random() * (config.gameWidth - player.getAttr('width')))
            , y: Math.abs(Math.random() * (config.gameHeight - player.getAttr('height')))
        });

        console.log('   player %s created for client %s', player.getAttr('id'), this.id);

        this.socket.emit('player.create', player.serialize());

        this.room.addEntity(player.getAttr('id'), player);

        // bind event handlers
        this.socket.on('player.move', this.onPlayerMove.bind(this));

        this.player = player;

        // just a single call for now
        this.syncClient();
    }
    , syncClient: function() {
        this.socket.emit('client.sync', this.room.getWorldState());
    }
    // event handler for when the player moves
    , onPlayerMove: function(input) {
        // todo: update the player state on the server
    }
    // event handler for when this client disconnects
    , onDisconnect: function() {
        this.player.die();
        this.room.removeEntity(this.player.getAttr('id'));

        // let other clients know that this client has left the room
        this.socket.broadcast.emit('player.leave', this.player.getAttr('id'));

        console.log('  client %s disconnected from room %s', this.id, this.room.id);
    }
});

module.exports = Client;

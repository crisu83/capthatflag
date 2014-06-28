'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
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
        var player = EntityFactory.create(this.socket, 'player')
            , id = shortid.generate();

        player.setAttrs({
            id: id
            , clientId: this.id
            // todo: add some logic for where to spawn the player
            // spawn the player at a random location for now
            , x: Math.abs(Math.random() * (config.gameWidth - player.getAttr('width')))
            , y: Math.abs(Math.random() * (config.gameHeight - player.getAttr('height')))
        });

        console.log('   player %s created for client %s', player.getAttr('id'), this.id);

        this.socket.emit('player.create', player.serialize());

        this.room.addEntity(id, player);

        // bind event handlers
        this.socket.on('entity.update', this.onEntityUpdate.bind(this));

        this.player = player;
    }
    // synchronizes this client with the server
    , sync: function(worldState) {
        this.socket.emit('client.sync', worldState);
    }
    // event handler for when an entity is updated
    , onEntityUpdate: function(state) {
        var newState = _.pick(state, ['timestamp', 'x', 'y']);

        if (state.input) {
            var step = (state.elapsed / 1000) * this.player.getAttr('speed');

            // reset the state to the last known state on the server
            newState.x = this.player.getAttr('x');
            newState.y = this.player.getAttr('y');

            // do the move on the server to to ensure that it is done correctly
            for (var i = 0; i < state.input.length; i++) {
                if (state.input[i] === 'up') {
                    newState.y -= step;
                } else if (state.input[i] === 'down') {
                    newState.y += step;
                }
                if (state.input[i] === 'left') {
                    newState.x -= step;
                } else if (state.input[i] === 'right') {
                    newState.x += step;
                }
            }
        }

        // update the player state on the server
        // and send the correct state the the client
        this.player.setAttrs(newState);
        this.socket.emit('entity.recon', newState);
    }
    // event handler for when this client disconnects
    , onDisconnect: function() {
        this.connected = false;

        // kill off the player
        this.player.die();

        // let other clients know that this client has left the room
        this.socket.broadcast.emit('player.leave', this.player.getAttr('id'));

        console.log('  client %s disconnected from room %s', this.id, this.room.id);
    }
});

module.exports = Client;

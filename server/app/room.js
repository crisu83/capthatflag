'use strict';

var utils = require('../../shared/utils')
    , shortid = require('shortid')
    , Client = require('./client')
    , ClientHashmap = require('./clientHashmap')
    , EntityHashmap = require('../../shared/entityHashmap')
    , config = require('./config.json')
    , Room;

/**
 * Room class.
 * @class server.Room
 * @property {string} id - Indentifier for the room.
 * @property {socketio.Server} io - Associated socket server instance.
 * @property {object} tilemap - Associated tilemap data.
 * @property {server.ClientHashmap} clients - Map of clients connected to the room.
 * @property {shared.EntityHashmap} entities - Map of entities in the room.
 * @property {number} lastTime - Timestamp for when the room logic was last updated.
 */
Room = utils.inherit(null, {
    id: null
    , io: null
    , tilemap: null
    , clients: null
    , entities: null
    , lastTick: null
    /**
     * Creates a new room.
     * @constructor
     * @param {socketio.Server} io - Socket server instance.
     */
    , constructor: function(io) {
        this.id = shortid.generate();
        this.io = io;
        // todo: change this to not be hard-coded
        this.tilemap = require('../data/tilemaps/dungeon.json');
        this.clients = new ClientHashmap();
        this.entities = new EntityHashmap();

        console.log(' room %s created', this.id);
    }
    /**
     * Initializes this room.
     * @method server.Room#init
     */
    , init: function() {
        // event handler for when a client connects
        this.io.on('connection', this.onConnection.bind(this));

        // start the game loop for this room with the configured tick rate
        console.log(' starting game loop for room %s', this.id);
        setInterval(this.gameLoop.bind(this), 1000 / config.ticksPerSecond);
    }
    /**
     * Event handler for when a client connects to this room.
     * @method server.Room#onConnection
     * @param {socketio.Socket} socket - Socket interface.
     */
    , onConnection: function(socket) {
        /* jshint camelcase:false */
        var clientId = socket.decoded_token.id
            , client = this.clients.get(clientId);

        // make sure that we do not create the game multiple times in
        // the client, that will cause an infinite loop and jam the browser
        if (!client) {
            client = new Client(clientId, socket, this);
            client.init();
            this.clients.add(clientId, client);
        }
    }
    /**
     * Updates the logic for this room.
     * @method server.Room#gameLoop
     */
    , gameLoop: function() {
        var now = +new Date()
            , elapsed;

        this.lastTick = this.lastTick || now;
        elapsed = now - this.lastTick;

        // update the entities in this room
        // and synchronize the current state to all clients
        this.entities.update(elapsed);
        this.clients.sync(this.getCurrentState());

        this.lastTick = now;
    }
    /**
     * Returns the current state of this room.
     * @method server.Room#getCurrentState
     * @return {object} Current state.
     */
    , getCurrentState: function() {
        var current = []
            , entities = this.entities.get()
            , state;

        for (var id in entities) {
            if (entities.hasOwnProperty(id)) {
                state = entities[id].getCurrentState(true);
                if (state) {
                    current.push(state);
                }
            }
        }

        return current;
    }
});

module.exports = Room;

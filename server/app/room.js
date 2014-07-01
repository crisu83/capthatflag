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
 */
Room = utils.inherit(null, {
    /**
     * Indentifier for this room.
     * @type {string}
     */
    id: null
    /**
     * Socket server instance associated with this room.
     * @type {socketio.Server}
     */
    , io: null
    /**
     * Tilemap data for this room.
     * @type {object}
     */
    , tilemap: null
    /**
     * Map of clients connected to this room.
     * @type {server.ClientHashmap}
     */
    , clients: null
    /**
     * Map of entities in this room.
     * @type {shared.EntityHashmap}
     */
    , entities: null
    /**
     * Timestamp for when the logic for this room was last updated.
     * @type {number}
     */
    , lastTick: null
    /**
     * Creates a new room.
     * @param {socketio.Server} io socket server instance.
     * @constructor
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
     * @param {socketio.Socket} socket socket interface.
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
     * @return {object} current state
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

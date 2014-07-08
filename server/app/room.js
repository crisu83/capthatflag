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
 * @property {number} lastTick - Timestamp for when the room logic was last updated.
 */
Room = utils.inherit(null, {
    id: null
    , primus: null
    , tilemap: null
    , clients: null
    , entities: null
    , lastTick: null
    /**
     * Creates a new room.
     * @constructor
     * @param {socketio.Server} io - Socket server instance.
     */
    , constructor: function(primus) {
        this.id = shortid.generate();
        this.primus = primus;
        // TODO change this to not be hard-coded
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
        this.primus.on('connection', this.onConnection.bind(this));

        // start the game loop for this room with the configured tick rate
        console.log(' starting game loop for room %s', this.id);
        setInterval(this.gameLoop.bind(this), 1000 / config.ticksPerSecond);
    }
    /**
     * Event handler for when a client connects to this room.
     * @method server.Room#onConnection
     * @param {primus.Spark} spark - Spark instance.
     */
    , onConnection: function(spark) {
        var clientId = shortid.generate()
            , client = this.clients.get(clientId);

        // make sure that we do not create the game multiple times in
        // the client, that will cause an infinite loop and jam the browser
        if (!client) {
            client = new Client(clientId, spark, this);
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
            , clients = this.clients.get()
            , state, elapsed;

        this.lastTick = this.lastTick || now;
        elapsed = now - this.lastTick;

        // update the entities in this room
        // and synchronize the current state to all clients
        this.entities.update(elapsed);
        // TODO add support for "area of interest"
        state = this.getState();
        this.clients.sync(state);

        this.lastTick = now;
    }
    /**
     * Returns the current state of this room.
     * @method server.Room#getCurrentState
     * @return {object} Current state.
     */
    , getState: function() {
        var current = []
            , entities = this.entities.get()
            , entity, state;

        for (var id in entities) {
            if (entities.hasOwnProperty(id)) {
                entity = entities[id];
                state = entity.state.getCurrent();
                if (state) {
                    current.push(state);
                }
            }
        }

        return current;
    }
});

module.exports = Room;

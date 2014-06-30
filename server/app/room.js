'use strict';

var utils = require('../../shared/utils')
    , shortid = require('shortid')
    , Client = require('./client')
    , ClientHashmap = require('./clientHashmap')
    , EntityHashmap = require('../../shared/entityHashmap')
    , config = require('./config.json');

var Room = utils.inherit(null, {
    id: null
    , io: null
    , game: null
    , tilemap: null
    , clients: null
    , entities: null
    , lastTick: null
    // constructor
    , constructor: function(io) {
        this.id = shortid.generate();
        this.io = io;
        // todo: change this to not be hard-coded
        this.tilemap = require('../data/tilemaps/dungeon.json');
        this.clients = new ClientHashmap();
        this.entities = new EntityHashmap();

        console.log(' room %s created', this.id);
    }
    // initializes this room
    , init: function() {
        // event handler for when a client connects
        this.io.on('connection', this.onConnection.bind(this));

        // start the game loop for this room with the configured tick rate
        console.log(' starting game loop for room %s', this.id);
        setInterval(this.gameLoop.bind(this), 1000 / config.ticksPerSecond);
    }
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
    // the game loop for this room
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
    // returns the current state of this room
    , getCurrentState: function() {
        var worldState = []
            , entities = this.entities.get()
            , state;

        for (var id in entities) {
            if (entities.hasOwnProperty(id)) {
                state = entities[id].getCurrentState(true);
                if (state) {
                    worldState.push(state);
                }
            }
        }

        return worldState;
    }
});

module.exports = Room;

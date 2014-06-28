'use strict';

var utils = require('../../shared/utils')
    , shortid = require('shortid')
    , Client = require('./client')
    , config = require('./config.json');

var Room = utils.inherit(null, {
    id: null
    , io: null
    , game: null
    , tilemap: null
    , clients: null
    , entities: null
    // constructor
    , constructor: function(io) {
        this.id = shortid.generate();
        this.io = io;
        // todo: change this to not be hard-coded
        this.tilemap = require('../data/tilemaps/dungeon.json');
        this.entities = {};
        this.clients = {};

        console.log(' room %s created', this.id);
    }
    // initializes this room
    , init: function() {
        // event handler for when a client connects
        this.io.on('connection', this.onConnection.bind(this));
    }
    , onConnection: function(socket) {
        /* jshint camelcase:false */
        var clientId = socket.decoded_token.id
            , client = this.clients[clientId];

        // make sure that we do not create the game multiple times in
        // the client, that will cause an infinite loop and jam the browser
        if (!client) {
            client = new Client(clientId, socket, this);
            client.init();
            this.clients[clientId] = client;
        }
    }
    // returns the current world state
    , getWorldState: function() {
        var id, worldState = [];
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                worldState.push(this.entities[id].serialize());
            }
        }

        return worldState;
    }
    // adds an entity to this room
    , addEntity: function(id, entity) {
        console.log('   entity %s added to room %s', id, this.id);
        this.entities[id] = entity;
    }
    // returns a specific entity in this room
    , getEntity: function(id) {
        return this.entities[id];
    }
    // removes an entity from this room
    , removeEntity: function(id) {
        if (this.entities[id]) {
            console.log('   entity %s removed from room %s', id, this.id);
            delete this.entities[id];
        }
    }
});

module.exports = Room;

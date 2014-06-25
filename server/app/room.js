'use strict';

var utils = require('../../shared/utils')
    , shortid = require('shortid')
    , Client = require('./client')
    , config = require('./config.json');

var Room = utils.inherit(null, {
    id: null
    , io: null
    , game: null
    , clients: null
    , entities: null
    // constructor
    , constructor: function(io) {
        this.id = shortid.generate();
        this.io = io;
        this.entities = {};
        this.clients = {};

        console.log(' room %s created', this.id);
    }
    // initializes this room
    , init: function() {
        var self = this;

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
});

module.exports = Room;

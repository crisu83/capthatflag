'use strict';

var path = require('path')
    , _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../../../shared/utils')
    , DataManager = require('./dataManager')
    , TilemapFactory = require('./tilemapFactory')
    , Client = require('./client')
    , ClientHashmap = require('../utils/clientHashmap')
    , EntityHashmap = require('../../../shared/utils/entityHashmap')
    , StateHistory = require('../../../shared/utils/stateHistory')
    , config = require('../config.json')
    , Room;

/**
 * Room class.
 * @class server.Room
 * @property {string} id - Indentifier for the room.
 * @property {socketio.Server} io - Associated socket server instance.
 * @property {object} tilemap - Associated tilemap data.
 * @property {server.ClientHashmap} clients - Map of clients connected to the room.
 * @property {shared.EntityHashmap} entities - Map of entities in the room.
 */
Room = utils.inherit(null, {
    id: null
    , primus: null
    , tilemap: null
    , clients: null
    , entities: null
    , _world: null
    , _bodies: null
    , _stateHistory: null
    , _lastSyncAt: null
    , _lastTickAt: null
    , _packetSequence: 0
    /**
     * Creates a new room.
     * @constructor
     * @param {socketio.Server} io - Socket server instance.
     */
    , constructor: function(primus) {
        this.id = shortid.generate();
        this.primus = primus;

        var dataPath = path.resolve(__dirname + '/../../data');
        DataManager.loadData(dataPath);

        // TODO change this to not be hard-coded
        this.tilemap = TilemapFactory.create('dungeon');
        this.clients = new ClientHashmap();
        this.entities = new EntityHashmap();

        this._stateHistory = new StateHistory(1000);

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
        setInterval(this.gameLoop.bind(this), 1000 / config.tickRate);
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
        var now = _.now()
            , elapsed;

        this._lastTickAt = this._lastTickAt || now;
        elapsed = now - this._lastTickAt;

        this.entities.each(function(entity) {
            entity.update(elapsed);
        }, this);

        if (!this._lastSyncAt || now - this._lastSyncAt > 1000 / config.syncRate) {
            var worldState = this.createWorldState();

            this.clients.each(function(client, id) {
                client.sync(worldState);
            }, this);

            this._lastSyncAt = now;
        }

        this._lastTickAt = now;
    }
    /**
     * Creates the current game state.
     * @method server.Room#createWorldState
     * @return {object} Current world state.
     */
    , createWorldState: function() {
        var now = _.now()
            , worldState = {sequence: this._packetSequence++, timestamp: now, entities: {}};

        this.entities.each(function(entity, id) {
            worldState.entities[id] = entity.serialize();
        });

        this._stateHistory.snapshot(worldState);

        //console.log(worldState.entities);

        return worldState;
    }
});

module.exports = Room;

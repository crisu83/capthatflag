'use strict';

var path = require('path')
    , _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../../../shared/utils')
    , Node = require('../../../shared/core/node')
    , DataManager = require('./dataManager')
    , TilemapFactory = require('./tilemapFactory')
    , Client = require('./client')
    , Hashmap = require('../../../shared/utils/hashmap')
    , ClientHashmap = require('../utils/clientHashmap')
    , EntityHashmap = require('../../../shared/utils/entityHashmap')
    , StateHistory = require('../../../shared/utils/stateHistory')
    , World = require('../../../shared/physics/world')
    , Team = require('./team')
    , config = require('../config.json')
    , Room;

/**
 * Room class.
 * @class server.core.Room
 * @classdesc Game room that clients can connect to.
 * @extends shared.core.Node
 */
Room = utils.inherit(Node, {
    /**
     * Creates a new room.
     * @constructor
     * @param {Primus.Server} primus - Primus server instance.
     */
    constructor: function(primus) {
        Node.apply(this);

        // resolve the data path and load the game data
        var dataPath = path.resolve(__dirname + '/../../../data');
        DataManager.loadData(dataPath);

        /**
         * @property {string} id - Indentifier for the room.
         */
        this.id = shortid.generate();
        /**
         * @property {Primus.Server} primus - Primus server instance.
         */
        this.primus = primus;
        /**
         * @property {server.core.Tilemap} tilemap - Tilemap instance.
         */
        this.tilemap = TilemapFactory.create('forrest');
        /**
         * @property {server.ClientHashmap} clients - Map of clients connected to the room.
         */
        this.clients = new ClientHashmap();
        /**
         * @property {shared.EntityHashmap} entities - Map of entities in the room.
         */
        this.entities = new EntityHashmap();
        /**
         * @property {shared.physics.World} world - Physical world.
         */
        this.world = new World();

        // internal variables
        this._teams = new Hashmap({
            red: new Team('red', 32, 32)
            //, green: new Team('green', config.gameWidth - 64, 32)
            //, magenta: new Team('magenta', 32, config.gameHeight - 96)
            , blue: new Team('blue', config.gameWidth - 64, config.gameHeight - 96)
        });
        this._stateHistory = new StateHistory(1000);
        this._lastSyncAt = null;
        this._lastTickAt = null;
        this._gameStartedAt = null;
        this._packageSequence = 0;
        this._running = true;

        this.tilemap.room = this;
        this.tilemap.init();

        console.log(' game room %s created', this.id);
    }
    /**
     * Initializes this room.
     * @method server.core.Room#init
     */
    , init: function() {
        // event handler for when a client connects
        this.primus.on('connection', this.onConnection.bind(this));

        // mark the time when the game started
        var now = _.now();
        this._gameStartedAt = now;
        this._lastTickAt = now;

        // start the game loop for this room with the configured tick rate
        setInterval(this.gameLoop.bind(this), 1000 / config.tickRate);
    }
    /**
     * Event handler for when a client connects to this room.
     * @method server.core.Room#onConnection
     * @param {Primus.Spark} spark - Spark instance.
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
     * @method server.core.Room#gameLoop
     */
    , gameLoop: function() {
        var now = _.now()
            , elapsed = now - this._lastTickAt;

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

        if (now - this._gameStartedAt > config.gameLengthSec * 1000) {
            this.resetGame();
        }

        this._lastTickAt = now;
    }
    /**
     * Creates the current game state.
     * @method server.core.Room#createWorldState
     * @return {object} Current world state.
     */
    , createWorldState: function() {
        var now = _.now()
            , worldState;

        worldState = {
            sequence: this._packetSequence++
            , timestamp: now
            , runTimeSec: (now - this._gameStartedAt) / 1000
            , entities: {}
        };

        this.entities.each(function(entity, id) {
            worldState.entities[id] = entity.serialize();
        });

        this._stateHistory.snapshot(worldState);

        //console.log(worldState.entities);

        return worldState;
    }
    /**
     * Returns the currently weakest team.
     * @method server.core.Room#weakestTeam
     * @return {server.core.Team} Team instance.
     */
    , weakestTeam: function() {
        var weakest, teamSize, leastPlayers;

        this._teams.each(function(team, name) {
            teamSize = team.size();
            if (typeof leastPlayers === 'undefined' || teamSize < leastPlayers) {
                leastPlayers = teamSize;
                weakest = team;
            }
        }, this);

        return weakest;
    }
    /**
     * Restarts the game.
     * @method server.core.Room#restartGame
     */
    , resetGame: function() {
        console.log(' game in room %s is restarting', this.id);

        this.entities.clear();

        this._teams.each(function(team) {
            team.removePlayers();
        }, this);

        this.clients.each(function(client) {
            client.resetGame();
        }, this);

        this._gameStartedAt = _.now();
    }
});

module.exports = Room;

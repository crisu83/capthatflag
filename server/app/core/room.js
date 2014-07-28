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
    , ClientList = require('../utils/clientList')
    , FlagHashmap = require('../utils/flagHashmap')
    , TeamHashmap = require('../utils/teamHashmap')
    , EntityHashmap = require('../../../shared/utils/entityHashmap')
    , Snapshot = require('../../../shared/core/snapshot')
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
         * @property {shared.EntityHashmap} entities - Map of entities in the room.
         */
        this.entities = new EntityHashmap();
        /**
         * @property {shared.physics.World} world - Physical world.
         */
        this.world = new World(config.gameWidth, config.gameHeight);
        /**
         * @property {number} flagCount - Number of available banners.
         */
        this.flagCount = 0;
        /**
         * @property {number} playerCount - Number of players online.
         */
        this.playerCount = 0;
        /**
         * @property {server.utils.TeamHashmap} teams - Map over teams in this room.
         */
        this.teams = new TeamHashmap();
        /**
         * @property {server.utils.FlagHashmap} flags - Map over flags in this room.
         */
        this.flags = new FlagHashmap();
        /**
         * @property {array} names - List of player names available.
         */
        this.names = [];

        // internal variables
        this._clients = new ClientList();
        this._lastSyncAt = null;
        this._lastTickAt = null;
        this._gameStartedAt = null;
        this._lastPointsAt = null;
        this._snapshotSequence = 0;
        this._running = true;

        console.log(' game room %s created', this.id);
    }
    /**
     * Initializes this room.
     * @method server.core.Room#init
     */
    , init: function() {
        // event handler for when a client connects
        this.primus.on('connection', this.onConnection.bind(this));

        this.tilemap.room = this;
        this.tilemap.init();

        // TODO move all data parsing to the data manager

        var namesJson = require('../../../data/names.json');
        this.names = _.shuffle(namesJson.names);

        var teamJson = require('../../../data/teams.json');
        _.forOwn(teamJson.teams, function(data) {
            data.name = data.key;
            data.x = data.x >= 0 ? data.x : config.gameWidth - data.x;
            data.y = data.y >= 0 ? data.y : config.gameHeight - data.y;
            this.teams.add(data.key, new Team(data));
        }, this);

        this.resetFlags();

        // mark the time when the game started
        var now = _.now();
        this._gameStartedAt = now;
        this._lastTickAt = now;

        this._running = true;

        // start the game loop for this room with the configured tick rate
        setInterval(this.gameLoop.bind(this), 1000 / config.tickRate);
    }
    /**
     * Event handler for when a client connects to this room.
     * @method server.core.Room#onConnection
     * @param {Primus.Spark} spark - Spark instance.
     */
    , onConnection: function(spark) {
        var client = new Client(spark, this);
        client.init();
        this._clients.add(client);
    }
    /**
     * Updates the logic for this room.
     * @method server.core.Room#gameLoop
     */
    , gameLoop: function() {
        if (this._running) {
            var now = _.now()
                , elapsed = now - this._lastTickAt;

            this.entities.each(function(entity) {
                entity.update(elapsed);
            }, this);

            if (!this._lastSyncAt || now - this._lastSyncAt > 1000 / config.syncRate) {
                var snapshot = this.createSnapshot()
                    , json = snapshot.serialize();

                // TODO filter the snapshot based on where the player is

                this._clients.each(function(client) {
                    client.sync(json);
                }, this);

                this._lastSyncAt = now;
            }

            if (!this._lastPointsAt || now - this._lastPointsAt > config.gamePointsSec * 1000) {
                this.awardFlagPoints();
            }

            if (now - this._gameStartedAt > config.gameLengthSec * 1000) {
                this.endGame();
            }

            this._lastTickAt = now;
        }
    }
    /**
     * Creates a snapshot of the current game state.
     * @method server.core.Room#createSnapshot
     * @return {server.core.Snapshot} Snapshot instance.
     */
    , createSnapshot: function() {
        var now = _.now()
            , snapshot;

        snapshot = new Snapshot();
        snapshot.sequence = this._snapshotSequence++;
        snapshot.createdAt = now;
        snapshot.entities = this.entities.serialize();
        snapshot.flags = this.flags.serialize();
        snapshot.scores = this.teams.calculateScores();
        snapshot.flagCount = this.flagCount;
        snapshot.playerCount = this.playerCount;
        snapshot.gameTimeElapsed = (now - this._gameStartedAt) / 1000;

        return snapshot;
    }
    /**
     * Awards points for flags.
     * @method server.core.Room#awardFlagPoints
     */
    , awardFlagPoints: function() {
        var now = _.now()
            , points = 0
            , team;

        this.flags.each(function(flags, key) {
            points = config.gamePointsPerFlag * flags.length;
            team = this.teams.get(key);
            team.awardPointsToPlayers(points);
            console.log('   players on team %s received %d points', key, points);
        }, this);

        this._lastPointsAt = now;
    }
    /**
     * Resets the banners in the room.
     * @method server.core.Room#resetFlags
     */
    , resetFlags: function() {
        this.teams.each(function(team, key) {
            this.flags.set(key, []);
        }, this);
    }
    /**
     * Ends the game in the room.
     * @method server.core.Room#endGame
     */
    , endGame: function() {
        this._running = false;

        var teamScores = this.teams.calculateScores()
            , topScore;

        // sort the scores so that the highest is first
        teamScores.sort(function(a, b) {
            return a.points > b.points;
        });

        topScore = teamScores.pop();
        console.log(' game in room %s won by %s team with %d points', this.id, topScore.team, topScore.points);

        this.entities.clear();

        this.teams.each(function(team) {
            team.removePlayers();
        }, this);

        this._clients.each(function(client) {
            client.endGame(topScore.team);
        }, this);

        setTimeout(this.resetGame.bind(this), config.gameResetSec * 1000);
    }
    /**
     * TODO
     */
    , resetGame: function() {
        this.resetFlags();
        this._clients.clear();

        this.flagCount = 0;
        this.tilemap.init();
        this._gameStartedAt = _.now();

        this._running = true;
    }
});

module.exports = Room;

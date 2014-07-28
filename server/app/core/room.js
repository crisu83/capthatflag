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

        this.names = [];

        // internal variables
        this._clients = new ClientList();
        //this._teams = new TeamHashmap();
        this._teams = null;
        this._flags = {};
        //this._flags = new FlagHashmap();
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

        var namesJson = require('../../../data/names.json');
        this.names = _.shuffle(namesJson.names);

        // TODO parse teams from json

        this._teams = new Hashmap({
            red: new Team('red', 32, 32)
            //, green: new Team('green', config.gameWidth - 64, 32)
            //, magenta: new Team('magenta', 32, config.gameHeight - 96)
            , blue: new Team('blue', config.gameWidth - 64, config.gameHeight - 96)
        });

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
        snapshot.flags = _.clone(this._flags);
        snapshot.scores = this.calculateTeamScores();
        snapshot.flagCount = this.flagCount;
        snapshot.playerCount = this.playerCount;
        snapshot.gameTimeElapsed = (now - this._gameStartedAt) / 1000;

        return snapshot;
    }
    /**
     * TODO
     */
    , calculateTeamScores: function() {
        var teamScore = [];

        this._teams.each(function(team) {
            teamScore.push({team: team.name, points: team.getTotalPoints()});
        }, this);

        return teamScore;
    }
    /**
     * Captures a flag from one team to another.
     * @method server.core.Room#captureFlag
     * @param {string} flagId - Flag identifier.
     * @param {string} fromTeam - Team losing the flag.
     * @param {string} toTeam - Team capturing the flag.
     */
    , captureFlag: function(flagId, fromTeam, toTeam) {
        if (_.has(this._flags, toTeam)) {

            if (_.has(this._flags, fromTeam)) {
                var index = this._flags[fromTeam].indexOf(flagId);

                if (index !== -1) {
                    this._flags[fromTeam].splice(index, 1);
                }
            }

            this._flags[toTeam].push(flagId);
            console.log('   player captured flag from team %s to team %s', fromTeam, toTeam);
        }
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
            if (_.isUndefined(leastPlayers) || teamSize < leastPlayers) {
                leastPlayers = teamSize;
                weakest = team;
            }
        }, this);

        return weakest;
    }
    /**
     * Awards points for flags.
     * @method server.core.Room#awardFlagPoints
     */
    , awardFlagPoints: function() {
        var now = _.now()
            , points = 0
            , team;

        _.forOwn(this._flags, function(flagId, key) {
            points = config.gamePointsPerFlag * this._flags[key].length;
            team = this._teams.get(key);
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
        this._teams.each(function(team, key) {
            this._flags[key] = [];
        }, this);
    }
    /**
     * Ends the game in the room.
     * @method server.core.Room#endGame
     */
    , endGame: function() {
        this._running = false;

        var teamScore = this.calculateTeamScores()
            , topScore;

        // sort the scores so that the highest is first
        teamScore.sort(function(a, b) {
            return a.points > b.points;
        });

        topScore = teamScore.pop();
        console.log(' game in room %s won by %s team with %d points', this.id, topScore.team, topScore.points);

        this.entities.clear();

        this._teams.each(function(team) {
            team.endGame();
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

'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../../../shared/utils')
    , Node = require('../../../shared/core/node')
    , DataManager = require('./dataManager')
    , EntityFactory = require('./entityFactory')
    , IoComponent = require('../../../shared/components/io')
    , PhysicsComponent = require('../../../shared/components/physics')
    , AttackComponent = require('../components/attack')
    , HealthComponent = require('../components/health')
    , InputComponent = require('../components/input')
    , PlayerComponent = require('../components/player')
    , config = require('../config.json')
    , Body = require('../../../shared/physics/body')
    , Client;

/**
 * Client class.
 * @class server.core.Client
 * @classdesc Client connected to the server.
 * @extends shared.Node
 */
Client = utils.inherit(Node, {
    /**
     * Creates a new client.
     * @constructor
     * @param {Primus.Spark} spark - Spark instance.
     * @param {server.Room} room - Room instance.
     */
    constructor: function(spark, room) {
        Node.apply(this);

        /**
         * @property {string} id - Identifier for the client.
         */
        this.id = shortid.generate();

        // internal properties
        this._spark = spark;
        this._room = room;
        this._config = null;
        this._player = null;
        this._ready = false;
    }
    /**
     * Initializes this client.
     * @method server.core.Client#init
     */
    , init: function() {
        // let the client know to which room they have connected
        this._spark.emit('client.joinRoom', this._room.id);

        console.log('  client %s connected to room %s', this.id, this._room.id);

        this._config = {
            // client identifier
            id: this.id
            // server configuration
            , tickRate: config.tickRate
            , syncRate: config.syncRate
            // client configuration
            , enablePrediction: config.enablePrediction
            , enableReconcilation: config.enableReconcilation
            , enableInterpolation: config.enableInterpolation
            , enableExtrapolation: config.enableExtrapolation
            , extrapolationMsec: config.extrapolationMsec
            // viewport configuration
            , canvasWidth: config.canvasWidth
            , canvasHeight: config.canvasHeight
            , gameWidth: config.gameWidth
            , gameHeight: config.gameHeight
            // map configuration
            , mapKey: this._room.tilemap.key
            , mapData: this._room.tilemap.data
            , mapType: this._room.tilemap.type
            , mapImage: this._room.tilemap.image
            , mapLayer: this._room.tilemap.layers
            , mapMusic: this._room.tilemap.music
            , mapWalls: this._room.tilemap.getWalls()
            // assets
            , images: DataManager.getImages()
            , spritesheets: DataManager.getSpritesheets()
            , audio: DataManager.getAudio()
            // game configuration
            , gameName: config.gameName
            , gameVersion: config.gameVersion
            , gameLengthSec: config.gameLengthSec
        };

        // send the configuration to the client
        this._spark.emit('client.init', this._config, config.debug);

        // bind event handlers
        this._spark.on('ping', this.onPing.bind(this));
        this._spark.on('client.ready', this.onReady.bind(this));
        this._spark.on('end', this.onDisconnect.bind(this));
    }
    /**
     * Event hanlder for when receiving a ping.
     * @method server.core.Client#onPing
     */
    , onPing: function(ping) {
        this._spark.emit('pong', ping);
    }
    /**
     * Event handler for when this client is ready.
     * @method server.core.Client#onReady
     */
    , onReady: function() {
        if (!this._ready) {
            this._player = this.createPlayer();
            this._ready = true;
        }
    }
    /**
     * Creates the player for the client.
     * @method server.core.Client#createPlayer
     * @return {shared.core.Entity} Player entity.
     */
    , createPlayer: function() {
        var entity = EntityFactory.create('player')
            , name = this._room.names.pop()
            , team = this._room.weakestTeam()
            , position = team.spawnPosition()
            , body = new Body('player', entity);

        // set initial entity attributes
        entity.attrs.set({
            name: name
            , team: team.name
            , image: 'player-' + team.name
            , x: position.x
            , y: position.y
        });

        // TODO use the entity factory to add the entity components
        entity.components.add(new IoComponent(this._spark));
        entity.components.add(new PhysicsComponent(body, this._room.world));
        entity.components.add(new AttackComponent());
        entity.components.add(new InputComponent());
        entity.components.add(new HealthComponent());
        entity.components.add(new PlayerComponent(team));

        // add the player to the team, the room and increase the player count
        team.addPlayer(entity);
        this._room.entities.add(entity.id, entity);
        this._room.playerCount++;
        console.log('  client %s joined %s team as player %s', this.id, team.name, entity.id);

        // let the client know that it can now create the player
        this._spark.emit('player.create', entity.serialize());

        return entity;
    }
    /**
     * Ends the game for the client.
     * @method server.core.Client#endGame
     * @param {string} winner - Name of the winning team.
     */
    , endGame: function(winner) {
        this._spark.emit('game.end', winner);

        if (this._player) {
            this._player.remove();
        }

        setTimeout(this.resetGame.bind(this), config.gameResetSec * 1000);
    }
    /**
     * TODO
     */
    , resetGame: function() {
        this._spark.emit('client.reset', this._config, config.debug);
    }
    /**
     * Synchronizes this client with the server.
     * @method server.core.Client#sync
     * @param {object} worldState - State to synchronize.
     */
    , sync: function(worldState) {
        this._spark.emit('client.sync', worldState);
    }
    /**
     * Event handler for when the client is disconnected.
     * @method server.core.Client#onDisconnect
     */
    , onDisconnect: function() {
        if (this._player) {
            var playerId = this._player.id;

            // remove the player
            this._player.remove();

            // let other clients know that the player left
            this._room.primus.forEach(function(spark) {
                spark.emit('player.leave', playerId);
            });

            this._room.playerCount--;
        }

        console.log('  client %s disconnected from room %s', this.id, this._room.id);
        this.trigger('client.disconnect', this);
    }
});

module.exports = Client;

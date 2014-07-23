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
     * @param {string} id - Client identifier.
     * @param {Primus.Spark} spark - Spark instance.
     * @param {server.Room} room - Room instance.
     */
    constructor: function(id, spark, room) {
        Node.apply(this);

        /**
         * @property {string} id - Identifier for the client.
         */
        this.id = id;
        /**
         * @property {Primus.Spark} spark - Spark interface.
         */
        this.spark = spark;
        /**
         * @property {server.Room} room - Room instance that the client is connected to.
         */
        this.room = room;
        /**
         * @property {object} config - Client configuration.
         */
        this.config = null;
        /**
         * @property {server.Entity} entity - Associated player entity instance.
         */
        this.player = null;
    }
    /**
     * Initializes this client.
     * @method server.core.Client#init
     */
    , init: function() {
        // let the client know to which room they have connected
        this.spark.emit('client.joinRoom', this.room.id);

        console.log('  client %s connected to room %s', this.id, this.room.id);

        this.config = {
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
            , mapKey: this.room.tilemap.key
            , mapData: this.room.tilemap.data
            , mapType: this.room.tilemap.type
            , mapImage: this.room.tilemap.image
            , mapLayer: this.room.tilemap.layers
            // assets
            , images: DataManager.getImages()
            , spritesheets: DataManager.getSpritesheets()
            // game configuration
            , gameLengthSec: config.gameLengthSec
        };

        // send the configuration to the client
        this.spark.emit('client.init', this.config, config.debug);

        // bind event handlers
        this.spark.on('ping', this.onPing.bind(this));
        this.spark.on('client.ready', this.onReady.bind(this));
        this.spark.on('end', this.onDisconnect.bind(this));
    }
    /**
     * Event hanlder for when receiving a ping.
     * @method server.core.Client#onPing
     */
    , onPing: function(ping) {
        this.spark.emit('pong', ping);
    }
    /**
     * Event handler for when this client is ready.
     * @method server.core.Client#onReady
     */
    , onReady: function() {
        this.player = this.createPlayer();
    }
    /**
     * Creates the player for the client.
     * @method server.core.Client#createPlayer
     * @return {shared.core.Entity} Player entity.
     */
    , createPlayer: function() {
        var entity = EntityFactory.create('player')
            , team = this.room.weakestTeam()
            , body = new Body('player', entity);

        entity.components.add(new IoComponent(this.spark));
        entity.components.add(new PhysicsComponent(body, this.room.world));
        entity.components.add(new AttackComponent());
        entity.components.add(new InputComponent());
        entity.components.add(new HealthComponent());
        entity.components.add(new PlayerComponent(team));

        team.addPlayer(entity);
        this.room.entities.add(entity.id, entity);

        entity.attrs.set({
            team: team.name
            , image: 'player-' + team.name
            , x: team.x
            , y: team.y
        });

        console.log('  client %s joined %s team as player %s', this.id, team.name, entity.id);
        this.spark.emit('player.create', entity.serialize());

        this.room.playerCount++;

        return entity;
    }
    /**
     * Resets the game for the client.
     * @method server.core.Client#resetGame
     */
    , resetGame: function() {
        this.spark.emit('client.reset', this.config, config.debug);
    }
    /**
     * Synchronizes this client with the server.
     * @method server.core.Client#sync
     * @param {object} worldState - State to synchronize.
     */
    , sync: function(worldState) {
        this.spark.emit('client.sync', worldState);
    }
    /**
     * Event handler for when the client is disconnected.
     * @method server.core.Client#onDisconnect
     */
    , onDisconnect: function() {
        var playerId = this.player.id;

        // remove the player
        this.player.remove();

        // let other clients know that the player left
        this.room.primus.forEach(function(spark) {
            spark.emit('player.leave', playerId);
        });

        this.room.playerCount--;

        console.log('  client %s disconnected from room %s', this.id, this.room.id);
        this.trigger('client.disconnect', [this.id]);
    }
});

module.exports = Client;

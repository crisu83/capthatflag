'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../../../shared/utils')
    , Node = require('../../../shared/core/node')
    , DataManager = require('./dataManager')
    , EntityFactory = require('./entityFactory')
    , InputComponent = require('../components/input')
    , config = require('../config.json')
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

        // send the configuration to the client
        this.spark.emit('client.init', {
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
        });

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
        var player = EntityFactory.create(this.spark, 'player')
            , team = this.room.weakestTeam()
            , body;

        team.addPlayer(player);
        this.room.entities.add(player.id, player);

        player.attrs.set({
            team: team.name
            , image: 'player-' + team.name
            , x: team.x
            , y: team.y
        });

        player.components.add(new InputComponent());

        console.log('  client %s joined %s team as player %s', this.id, team.name, player.id);

        this.spark.emit('player.create', player.serialize());
        this.player = player;
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
        this.player.die();

        // let other clients know that this client has left the room
        this.room.primus.forEach(function(spark) {
            spark.emit('player.leave', playerId);
        });

        console.log('  client %s disconnected from room %s', this.id, this.room.id);
        this.trigger('client.disconnect', [this.id]);
    }
});

module.exports = Client;

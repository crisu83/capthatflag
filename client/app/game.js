'use strict';

var utils = require('../../shared/utils')
    , EntityHashmap = require('../../shared/entityHashmap')
    , StateHistory = require('../../shared/stateHistory')
    , Entity = require('./entity')
    , ActorComponent = require('./components/actor')
    , PlayerComponent = require('./components/player');

/**
 * Runs the game.
 * @param {primus.Client} primus - Client instance.
 * @param {object} config - Game configuration.
 */
function run(primus, config) {
    console.log('creating client', config);

    /**
     * Gameplay state class.
     * @class client.GameplayState
     * @classdesc Game state that runs the acutal game.
     * @extends Phaser.State
     * @property {shared.EntityHashmap} entities - Map over entities in the state.
     */
    var GameplayState = utils.inherit(Phaser.State, {
        entities: null
        , player: null
        , _stateHistory: null
        /**
         * Creates a new game state.
         * @constructor
         */
        , constructor: function() {
            this.entities = new EntityHashmap();
            this._stateHistory = new StateHistory((1000 / config.tickRate) * 3);
        }
        /**
         * Loads the game assets.
         * @method client.GameplayState#preload
         * @param {Phaser.Game} game - Game instance.
         */
        , preload: function(game) {
            console.log('loading assets ...');

            game.load.tilemap(config.mapKey, null, config.mapData, config.mapType);
            game.load.image(config.mapImage, 'static/' + config.mapSrc);

            game.load.image('player-male', 'static/assets/images/sprites/player/male.png');
            game.load.image('player-female', 'static/assets/images/sprites/player/female.png');
        }
        /**
         * Creates the game objects.
         * @method client.GameplayState#creeate
         * @param {Phaser.Game} game - Game instance.
         */
        , create: function(game) {
            console.log('creating game ...');

            var map, layer;

            // define the world bounds
            game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

            // set the background color for the stage
            game.stage.backgroundColor = '#000';

            // start the arcade physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

            map = game.add.tilemap(config.mapKey);
            map.addTilesetImage(config.mapKey, config.mapImage);
            layer = map.createLayer(config.mapLayer);
            layer.resizeWorld();

            // bind event handlers
            primus.on('player.create', this.onPlayerCreate.bind(this));
            primus.on('player.leave', this.onPlayerLeave.bind(this));

            // let the server know that client is ready
            primus.emit('client.ready');
        }
        /**
         * Event handler for creating the player.
         * @method client.GameplayState#onPlayerCreate
         * @param {object} state - Player state.
         */
        , onPlayerCreate: function(state) {
            console.log('creating player', state);

            var entity = this.createEntity(state)
                , sprite = this.game.add.sprite(state.attrs.x, state.attrs.y, state.attrs.image)
                , physics = state.attrs.physics || -1;

            if (physics >= 0) {
                this.game.physics.enable(sprite, physics);
                sprite.physicsBodyType = physics;
                //sprite.body.collideWorldBounds = true;
                sprite.body.immovable = true;
            }

            entity.components.add(new ActorComponent(sprite));
            entity.components.add(new PlayerComponent(this.game.input));

            this.entities.add(state.id, entity);

            this.player = entity;

            // now we are ready to synchronization the world with the server
            primus.on('client.sync', this.onSync.bind(this));
        }
        /**
         * Event handler for synchronizing the client with the server.
         * @method client.GameplayState#onSync
         * @param {object} worldState - World state.
         */
        , onSync: function(worldState) {
            var state, entity, sprite, physics;

            this._stateHistory.snapshot(worldState);

            for (var i = 0; i < worldState.length; i++) {
                state = worldState[i];
                entity = this.entities.get(state.id);

                // if the entity does not exist, we need to create it
                if (!entity) {
                    console.log('creating new entity', state);
                    entity = this.createEntity(state);
                    sprite = this.game.add.sprite(state.attrs.x, state.attrs.y, state.attrs.image);
                    physics = state.attrs.physics || -1;

                    if (physics >= 0) {
                        this.game.physics.enable(sprite, physics);
                        sprite.physicsBodyType = physics;
                        //sprite.body.collideWorldBounds = true;
                        sprite.body.immovable = true;
                    }

                    if (!entity) {
                        throw new Error('Failed to create entity ' + state.id + '!');
                    }

                    entity.components.add(new ActorComponent(sprite));

                    this.entities.add(entity.id, entity);
                }

                if (state.id !== this.player.id) {
                    entity.attrs.set(state.attrs);
                }
            }
        }
        /**
         * Event handler for when a player leaves.
         * @method client.GameplayState#onPlayerLeave
         * @param {string} id - Player identifier.
         */
        , onPlayerLeave: function (id) {
            console.log('player left', id);

            var player = this.entities.get(id);

            if (player) {
                player.die();
            }
        }
        /**
         * Updates the logic for this game.
         * @method client.GameplayState#update
         * @param {Phaser.Game} game - Game instance.
         */
        , update: function(game) {
            // TODO: add collision detection

            var elapsed = game.time.elapsed;

            this.entities.update(elapsed);
        }
        /**
         * Creates a new entity.
         * @method client.GameplayState#createEntity
         * @param {object} data - Entity data.
         */
        , createEntity: function(data) {
            return new Entity(primus, data, config);
        }
    });

    // create the actual game
    var game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO);
    game.state.add('gameplay', new GameplayState(), true/* autostart */);
}

module.exports = {
    run: run
};

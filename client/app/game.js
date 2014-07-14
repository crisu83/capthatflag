'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
    , EntityHashmap = require('../../shared/entityHashmap')
    , StateHistory = require('../../shared/stateHistory')
    , Entity = require('../../shared/entity')
    , ActorComponent = require('./components/actor')
    , PlayerComponent = require('./components/player')
    , SyncComponent = require('./components/sync');

/**
 * Runs the game.
 * @param {primus.Client} primus - Client instance.
 * @param {object} config - Game configuration.
 */
function run(primus, config) {
    console.log('creating client', config);

    /**
     * Play state class.
     * @class client.PlayState
     * @classdesc Game state that runs the acutal game play.
     * @extends Phaser.State
     * @property {shared.EntityHashmap} entities - Map over entities in the state.
     * @property {client.Entity} player - Player entity instance.
     */
    var PlayState = utils.inherit(Phaser.State, {
        entities: null
        , player: null
        , _stateHistory: null
        , _lastSyncAt: null
        , _lastTickAt: null
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
         * @method client.PlayState#preload
         * @param {Phaser.Game} game - Game instance.
         */
        , preload: function(game) {
            console.log('loading assets ...');

            game.load.tilemap(config.mapKey, null, config.mapData, config.mapType);

            this.loadImages(game);
        }
        /**
         * Loads all image assets.
         * @param {Phaser.Game} game - Game instance.
         */
        , loadImages: function(game) {
            for (var key in config.images) {
                if (config.images.hasOwnProperty(key)) {
                    game.load.image(key, 'static/assets/' + config.images[key]);
                }
            }
        }
        /**
         * Creates the game objects.
         * @method client.PlayState#creeate
         * @param {Phaser.Game} game - Game instance.
         */
        , create: function(game) {
            console.log('creating game ...');

            var map, layer, pauseKey;

            // define the world bounds
            game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

            // set the background color for the stage
            game.stage.backgroundColor = '#000';

            // start the arcade physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

            map = game.add.tilemap(config.mapKey);
            map.addTilesetImage(config.mapKey, config.mapImage);
            layer = map.createLayer(config.mapLayer[0]);
            layer.resizeWorld();

            pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
            pauseKey.onDown.add(this.onGamePause.bind(this, game));

            // bind event handlers
            primus.on('player.create', this.onPlayerCreate.bind(this));
            primus.on('player.leave', this.onPlayerLeave.bind(this));

            // let the server know that client is ready
            primus.emit('client.ready');
        }
        /**
         * Event handler for when the game is paused.
         * @method client.PlayState#onGamePause
         */
        , onGamePause: function(game, event) {
            game.paused = !game.paused;
            console.log(game.paused ? 'game paused' : 'game resumed');
        }
        /**
         * Event handler for creating the player.
         * @method client.PlayState#onPlayerCreate
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
         * @method client.PlayState#onSync
         * @param {object} worldState - World state.
         */
        , onSync: function(worldState) {
            var now = +new Date();

            worldState.timestamp = now;
            this._stateHistory.snapshot(worldState);

            this._lastSyncAt = now;
        }
        /**
         * Event handler for when a player leaves.
         * @method client.PlayState#onPlayerLeave
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
         * @method client.PlayState#update
         * @param {Phaser.Game} game - Game instance.
         */
        , update: function(game) {
            // TODO: add collision detection

            var now = +new Date()
                , elapsed = game.time.elapsed;

            this.updateWorldState(elapsed);
            this.entities.update(elapsed);

            this._lastTickAt = game.time.lastTime;
        }
        /**
         * Updates the world state using the state history.
         * @method client.PlayState#updateWorldState
         * @param {number} elapsed - Time elapsed since the previous update (ms).
         */
        , updateWorldState: function(elapsed) {
            var worldState = this._stateHistory.last();

            if (worldState) {
                var now = +new Date()
                    , previousState = this._stateHistory.previous();

                if (previousState) {
                    if (config.enableInterpolation && true || this.canInterpolate()) {
                        var factor = this.calculateInterpolationFactor(previousState, worldState);
                        worldState = this.interpolateWorldState(previousState, worldState, factor);
                    } else if (config.enableExtrapolation && this.canExtrapolate()) {
                        // TODO add support for world state extrapolation
                        //worldState = this.extrapolateWorldState(previousState, worldState, factor);
                    }
                }

                var state, entity, sprite, physics;

                for (var id in worldState.entities) {
                    if (worldState.entities.hasOwnProperty(id)) {
                        state = worldState.entities[id];
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
                            entity.components.add(new SyncComponent());

                            this.entities.add(entity.id, entity);
                        }

                        entity.sync(state.attrs);
                    }
                }
            }
        }
        /**
         * Calculates an interpolation factor based on the two given snapshots.
         * @method client.PlayState#calculateInterpolationFactor
         * @param {object} previous - Previous snapshot.
         * @param {object} next - Next snapshot.
         * @return {number} Interpolation factory (a number between 0 and 1).
         */
        , calculateInterpolationFactor: function(previous, next) {
            var lerpMsec = (1000 / config.syncRate) * 2
                , lerpTime = this._lastTickAt - lerpMsec
                , delta = lerpTime - previous.timestamp
                , timestep = next.timestamp - previous.timestamp;

            return delta / timestep;
        }
        /**
         * Returns whether the state can be interpolated.
         * @method client.PlayState#canInterpolate
         * @return {boolean} The result.
         */
        , canInterpolate: function() {
            var endTime = +new Date() - (1000 / config.syncRate)
                , last = this._stateHistory.last();

            return this._stateHistory.size() >= 2 && last.timestamp < endTime;
        }
        /**
          * Returns whether the state can be extrapolated.
          * @method client.PlayState#canExtrapolate
          * @return {boolean} The result.
          */
        , canExtrapolate: function() {
            var now = +new Date()
                , startTime = now - (1000 / config.syncRate)
                , endTime = now - config.extrapolationMsec
                , last = this._stateHistory.last();

            return this._stateHistory.size() >= 2 && last.timestamp < startTime && last.timestamp > endTime;
        }
        /**
         * Creates an approximate snapshot of the world state using linear interpolation.
         * @method client.PlayState#interpolateWorldState
         * @param {object} previous - Previous snapshot.
         * @param {object} next - Next snapshot.
         * @return {object} Interpolated world state.
         */
        , interpolateWorldState: function(previous, next, factor) {
            var worldState = _.clone(next)
                , entityState;

            if (factor >= 0 && factor <= 1) {
                for (var id in next.entities) {
                    if (next.entities.hasOwnProperty(id) && previous.entities[id]) {
                        entityState = this.interpolateEntityState(
                            previous.entities[id]
                            , next.entities[id]
                            , factor
                        );
                        // TODO Test with a bigger sprite if this "smoothing" is necessary
                        /*
                        entityState = this.interpolateEntityState(
                            previous.entities[id]
                            , entityState
                            , 0.3
                        );
                        */
                        worldState.entities[id] = entityState;
                    }
                }
            }

            return worldState;
        }
        /**
         * Creates an approximate snapshot of an entity.
         * @method client.PlayState#interpolateEntityState
         * @param {object} previous - Previous snapshot.
         * @param {object} next - Next snapshot.
         * @return {object} Interpolated entity state.
         */
        , interpolateEntityState: function(previous, next, factor) {
            var entityState = _.clone(next);

            for (var name in next.attrs) {
                if (next.attrs.hasOwnProperty(name) && previous.attrs[name]) {
                    entityState.attrs[name] = utils.lerp(previous.attrs[name], next.attrs[name], factor);
                }
            }

            return entityState;
        }
        /**
         * Creates an approximate snapshot of the world state using linear extrapolation.
         * @method client.PlayState#extrapolateWorldState
         * @param {object} previous - Previous snapshot.
         * @param {object} next - Next snapshot.
         * @return {object} Interpolated world state.
         */
        , extrapolateWorldState: function() {
            // TODO implement entity extrapolation
        }
        /**
         * Creates a new entity.
         * @method client.PlayState#createEntity
         * @param {object} data - Entity data.
         */
        , createEntity: function(data) {
            return new Entity(primus, data, config);
        }
    });

    // create the actual game
    var game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO);
    game.state.add('play', new PlayState(), true/* autostart */);
}

module.exports = {
    run: run
};

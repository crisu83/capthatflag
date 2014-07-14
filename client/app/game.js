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
         * @method client.GameplayState#preload
         * @param {Phaser.Game} game - Game instance.
         */
        , preload: function(game) {
            console.log('loading assets ...');

            game.load.tilemap(config.mapKey, null, config.mapData, config.mapType);
            game.load.image(config.mapImage, 'static/' + config.mapSrc);

            // TODO Load dynamically
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
            var now = +new Date();

            worldState.timestamp = now;
            this._stateHistory.snapshot(worldState);

            this._lastSyncAt = now;
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

            var now = +new Date()
                , elapsed = game.time.elapsed;

            this.updateWorldState(elapsed);
            this.entities.update(elapsed);

            this._lastTickAt = game.time.lastTime;

            /*
            if (game.time.totalElapsedSeconds() > 5) {
                game.paused = true;
            }
            */
        }
        /**
         * TODO
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
         * TODO
         */
        , canInterpolate: function() {
            var endTime = +new Date() - (1000 / config.syncRate)
                , last = this._stateHistory.last();

            return this._stateHistory.size() >= 2 && last.timestamp < endTime;
        }
        /**
         * TODO
         */
        , calculateInterpolationFactor: function(previous, next) {
            var lerpMsec = (1000 / config.syncRate) * 2
                , lerpTime = this._lastTickAt - lerpMsec
                , delta = lerpTime - previous.timestamp
                , timestep = next.timestamp - previous.timestamp;

            return delta / timestep;
        }
        /**
         * TODO
         */
        , canExtrapolate: function() {
            var now = +new Date()
                , startTime = now - (1000 / config.syncRate)
                , endTime = now - config.extrapolationMsec
                , last = this._stateHistory.last();

            return this._stateHistory.size() >= 2 && last.timestamp < startTime && last.timestamp > endTime;
        }
        /**
         * TODO
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
         * TODO
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
         * TODO
         */
        , extrapolateWorldState: function() {
            // TODO implement entity extrapolation
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
    game.state.add('play', new PlayState(), true/* autostart */);
}

module.exports = {
    run: run
};

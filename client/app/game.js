'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
    , EntityHashmap = require('../../shared/utils/entityHashmap')
    , StateHistory = require('../../shared/utils/stateHistory')
    , Entity = require('../../shared/core/entity')
    , AttackComponent = require('./components/attack')
    , InputComponent = require('./components/input')
    , PlayerComponent = require('./components/player')
    , SyncComponent = require('./components/sync');

/**
 * Runs the game.
 * @param {Primus.Client} primus - Client instance.
 * @param {object} config - Game configuration.
 */
function run(primus, config) {
    console.log('creating client', config);

    var debug = true;

    /**
     * Play state class.
     * @class client.PlayState
     * @classdesc Game state that runs the actual game play.
     * @extends Phaser.State
     */
    var PlayState = utils.inherit(Phaser.State, {
        /**
         * Creates a new game state.
         * @constructor
         */
        constructor: function() {
            /**
             * @property {shared.EntityHashmap} entities - Map over entities in the state.
             */
            this.entities = new EntityHashmap();
            /**
             * @property {shared.core.Entity} player - Player entity.
             */
            this.player = null;

            // internal properties
            this._ping = 0;
            this._pingText = null;
            this._pingSentAt = null;
            this._playerGroup = null;
            this._stateHistory = new StateHistory((1000 / config.syncRate) * 3);
            this._lastSyncAt = null;
            this._lastTickAt = null;
        }
        /**
         * Loads the game assets.
         * @method client.PlayState#preload
         * @param {Phaser.Game} game - Game instance.
         */
        , preload: function(game) {
            console.log('loading assets ...');

            this.load.tilemap(config.mapKey, null, config.mapData, config.mapType);
            this.loadAssets(game);
        }
        /**
         * Loads all assets.
         * @param {Phaser.Game} game - Game instance.
         */
        , loadAssets: function() {
            // load images
            _.forOwn(config.images, function(src, key) {
                this.load.image(key, 'static/assets/' + src);
            }, this);

            // load spritesheets
            _.forOwn(config.spritesheets, function(spritesheet, key) {
                this.load.spritesheet(
                    key
                    , 'static/assets/' + spritesheet.src
                    , spritesheet.width
                    , spritesheet.height
                    , spritesheet.frames
                );
            }, this);
        }
        /**
         * Creates the game objects.
         * @method client.PlayState#creeate
         * @param {Phaser.Game} game - Game instance.
         */
        , create: function(game) {
            console.log('creating game ...');

            var map, layer, style, text, pauseKey;

            // define the world bounds
            game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

            // set the background color for the stage
            game.stage.backgroundColor = '#000';

            // create the map
            map = game.add.tilemap(config.mapKey);
            map.addTilesetImage(config.mapKey, config.mapImage);
            _.forOwn(config.mapLayer, function(layerData) {
                layer = map.createLayer(layerData);
                layer.resizeWorld();
            }, this);

            this.playerGroup = this.add.group();

            style = {font: "12px Arial", fill: "#ffffff", align: "left"};
            text = this.add.text(config.canvasWidth - 70, 10, '', style);
            text.fixedToCamera = true;
            this._pingText = text;

            if (debug) {
                pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
                pauseKey.onDown.add(this.onGamePause.bind(this));
            }

            // bind event handlers
            primus.on('pong', this.onPong.bind(this));
            primus.on('player.create', this.onPlayerCreate.bind(this));
            primus.on('player.leave', this.onPlayerLeave.bind(this));

            // let the server know that client is ready
            primus.emit('client.ready');
        }
        /**
         * Event handler for when the game is paused.
         * @method client.PlayState#onGamePause
         */
        , onGamePause: function(event) {
            this.paused = !this.paused;
            console.log(this.paused ? 'game paused' : 'game resumed');
        }
        /**
         * Event handler for creating the player.
         * @method client.PlayState#onPlayerCreate
         * @param {object} state - Player state.
         */
        , onPlayerCreate: function(state) {
            console.log('creating player', state);

            var entity = this.createEntity(state)
                , sprite = this.playerGroup.create(state.attrs.x, state.attrs.y, state.attrs.image)
                , crossair = this.add.sprite(0, 0, 'player-crossair')
                , input = this.game.input;

            entity.components.add(new PlayerComponent(sprite));
            entity.components.add(new AttackComponent(crossair, input));
            entity.components.add(new InputComponent(input));

            this.entities.add(state.id, entity);

            this.camera.follow(sprite);

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
            var now = _.now();

            // TODO This shoud not be done
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
            var now = game.time.now
                , elapsed = game.time.elapsed / 1000;

            this.updateWorldState();
            this.updatePhysics();
            this.updateEntities(elapsed);
            this.updatePing();

            this._lastTickAt = game.time.lastTime;
        }
        /**
         * Updates the entities in the state.
         * @method client.PlayState#updateEntities
         */
        , updateEntities: function(elapsed) {
            this.entities.each(function(entity, id) {
                entity.update(elapsed);
            }, this);
        }
        /**
          * Updates the physics in the state.
          * @method client.PlayState#updatePhysics
          */
        , updatePhysics: function() {
            // TODO implement
        }
        /**
         * Updates the ping text.
         * @method client.PlayState#updatePing
         */
        , updatePing: function() {
            var now = _.now();

            if (!this._pingSentAt || now - this._pingSentAt > 100) {
                var ping = Math.round(this._ping / 10) * 10;
                if (ping < 10) {
                    ping = 10;
                }
                this._pingText.text = 'ping: ' + ping + 'ms';
                primus.emit('ping', {timestamp: now});
                this._pingSentAt = now;
            }
        }
        /**
         * Event handler for when receiving a ping response.
         * @method client.PlayState#onPong
         * @param {object} ping - Ping object.
         */
        , onPong: function(ping) {
            this._ping = _.now() - ping.timestamp;
        }
        /**
         * Updates the world state using the state history.
         * @method client.PlayState#updateWorldState
         */
        , updateWorldState: function() {
            var worldState = this._stateHistory.last();

            if (worldState) {
                var now = _.now()
                    , previousState = this._stateHistory.previous()
                    , factor;

                if (previousState) {
                    if (config.enableInterpolation && this.canInterpolate()) {
                        factor = this.calculateInterpolationFactor(previousState, worldState);
                        worldState = this.interpolateWorldState(previousState, worldState, factor);
                    } else if (config.enableExtrapolation && this.canExtrapolate()) {
                        // TODO add support for world state extrapolation
                        factor = 1;
                        worldState = this.extrapolateWorldState(previousState, worldState, factor);
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
                            sprite = this.playerGroup.create(state.attrs.x, state.attrs.y, state.attrs.image);

                            entity.components.add(new SyncComponent());
                            entity.components.add(new PlayerComponent(sprite));

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
            var endTime = _.now() - (1000 / config.syncRate)
                , last = this._stateHistory.last();

            return this._stateHistory.size() >= 2 && last.timestamp < endTime;
        }
        /**
          * Returns whether the state can be extrapolated.
          * @method client.PlayState#canExtrapolate
          * @return {boolean} The result.
          */
        , canExtrapolate: function() {
            var now = _.now()
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
                _.forOwn(next.entities, function(entity, id) {
                    if (previous.entities[id]) {
                        entityState = this.interpolateEntityState(
                            previous.entities[id]
                            , entity
                            , factor
                        );
                        // TODO Test with a bigger sprite if this "smoothing" is necessary
                        /*
                        entityState = this.interpolateEntityState(
                            previous.entities[id]
                            , entityState
                            , 0.3
                        );
                        worldState.entities[id] = entityState;
                        */
                    }
                }, this);
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
            var entityState = _.clone(next)
                , previousValue;

            _.forOwn(next.attrs, function(value, name) {
                previousValue = previous.attrs[name];
                if (this.canInterpolateValue(previousValue, value)) {
                    entityState.attrs[name] = utils.lerp(previousValue, value, factor);
                }
            }, this);

            return entityState;
        }
        /**
         * Returns whether the given value can be interpolated.
         * @method client.PlayState#canInterpolateValue
         * @param {object} previous - Previous value.
         * @param {object} next - Next value.
         * @return {boolean} The result.
         */
        , canInterpolateValue: function(previous, next) {
            return typeof next === 'number' && typeof previous !== 'undefined';
        }
        /**
         * Creates an approximate snapshot of the world state using linear extrapolation.
         * @method client.PlayState#extrapolateWorldState
         * @param {object} previous - Previous snapshot.
         * @param {object} next - Next snapshot.
         * @param {number} factor - Interpolation factor.
         * @return {object} Interpolated world state.
         */
        , extrapolateWorldState: function(previous, next, factor) {
            // TODO implement entity extrapolation
            return next;
        }
        /**
         * Creates a new entity.
         * @method client.PlayState#createEntity
         * @param {object} data - Entity data.
         */
        , createEntity: function(data) {
            return new Entity(primus, data, config);
        }
        /**
         * Renders the state.
         * @method client.PlayState#render
         * @param {Phaser.Game} game - Game instance.
         */
        , render: function(game) {
            if (debug) {
                // TODO implement visual debugging
            }
        }
    });

    // create the actual game
    var game = new Phaser.Game(
        config.canvasWidth
        , config.canvasHeight
        , Phaser.AUTO
        , 'dungeon'
    );

    game.state.add('play', new PlayState(), true/* autostart */);
}

module.exports = {
    run: run
};

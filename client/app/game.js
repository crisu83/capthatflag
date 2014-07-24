'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
    , List = require('../../shared/utils/list')
    , World = require('../../shared/physics/world')
    , Body = require('../../shared/physics/body')
    , EntityHashmap = require('../../shared/utils/entityHashmap')
    , StateHistory = require('../../shared/utils/stateHistory')
    , Entity = require('../../shared/core/entity')
    , IoComponent = require('../../shared/components/io')
    , PhysicsComponent = require('../../shared/components/physics')
    , AttackComponent = require('./components/attack')
    , BannerComponent = require('./components/banner')
    , InputComponent = require('./components/input')
    , PlayerComponent = require('./components/player')
    , SyncComponent = require('./components/sync');

/**
 * Runs the game.
 * @param {Primus.Client} primus - Client instance.
 * @param {object} config - Game configuration.
 */
function run(primus, config) {
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
            /**
             * @property {shared.physics.World} foo - World instance.
             */
            this.foo = new World(config.gameWidth, config.gameHeight);

            // internal properties
            this._ping = 0;
            this._pingText = null;
            this._pingSentAt = null;
            this._runTimeSec = 0;
            this._runTimeText = null;
            this._statsText = null;
            this._bannerText = null;
            this._teamBanners = 0;
            this._totalBanners = 0;
            this._playerText = null;
            this._totalPlayers = 0;
            this._pointsText = null;
            this._entityGroup = null;
            this._effectGroup = null;
            this._music = null;
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
            this.log('creating client', config);
            this.log('loading assets ...');

            this.load.tilemap(config.mapKey, null, config.mapData, config.mapType);
            this.loadAssets(game);
        }
        /**
         * Loads game assets.
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

            // load audio
            _.forOwn(config.audio, function(files, key) {
                _.forOwn(files, function(src, index) {
                    files[index] = 'static/assets/' + src;
                }, this);

                this.load.audio(key, files);
            }, this);
        }
        /**
         * Creates the game objects.
         * @method client.PlayState#creeate
         * @param {Phaser.Game} game - Game instance.
         */
        , create: function(game) {
            this.log('creating game ...');

            var map, layer, style, text, pauseKey, muteKey;

            // define the world bounds
            this.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

            // set the background color for the stage
            this.stage.backgroundColor = '#000';

            // create the map
            map = this.add.tilemap(config.mapKey);
            map.addTilesetImage(config.mapKey, config.mapImage);
            _.forOwn(config.mapLayer, function(layerData) {
                layer = map.createLayer(layerData);
                layer.resizeWorld();
            }, this);

            this._music = this.add.audio(
                config.mapMusic
                , 0.1/* volume */
                , true/* loop */
            );
            this._music.play();

            this.entityGroup = this.add.group();
            this.effectGroup = this.add.group();

            style = {
                font: "14px Courier"
                , stroke: "#000000"
                , strokeThickness: 5
                , fill: "#ffffff"
            };

            text = this.add.text(10, 10, '', style);
            text.fixedToCamera = true;
            this._playerText = text;

            text = this.add.text(10, 30, '', style);
            text.fixedToCamera = true;
            this._pingText = text;

            text = this.add.text(10, config.canvasHeight - 90, '', style);
            text.fixedToCamera = true;
            this._pointsText = text;

            text = this.add.text(10, config.canvasHeight - 70, '', style);
            text.fixedToCamera = true;
            this._bannerText = text;

            text = this.add.text(10, config.canvasHeight - 50, '', style);
            text.fixedToCamera = true;
            this._statsText = text;

            text = this.add.text(10, config.canvasHeight - 30, '', style);
            text.fixedToCamera = true;
            this._runTimeText = text;

            //text = this.add.text(config.canvasWidth - 230, 10, config.gameName + ' ' + config.gameVersion, style);
            //text.fixedToCamera = true;

            if (DEBUG) {
                pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
                pauseKey.onDown.add(this.onGamePause.bind(this));
            }

            muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
            muteKey.onDown.add(this.onMusicMuted.bind(this));

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
        , onGamePause: function() {
            this.paused = !this.paused;
            this.log(this.paused ? 'game paused' : 'game resumed');
        }
        /**
         * Event handler for when mute is pressed.
         * @method client.PlayState#onMusicMuted
         */
        , onMusicMuted: function() {
            this._music.mute = !this._music.mute;
            this.log(this._music.mute ? 'game music muted' : 'game music unmuted');
        }
        /**
         * Event handler for creating the player.
         * @method client.PlayState#onPlayerCreate
         * @param {object} state - Player state.
         */
        , onPlayerCreate: function(state) {
            this.log('creating player', state);

            var entity = this.createEntity(state)
                , playerSprite = this.entityGroup.create(state.attrs.x, state.attrs.y, state.attrs.image)
                , attackSprite = this.effectGroup.create(0, 0, 'attack-sword')
                , body = new Body('player', entity);

            this.camera.follow(playerSprite);

            entity.components.add(new PlayerComponent(playerSprite));
            entity.components.add(new IoComponent(primus));
            entity.components.add(new AttackComponent(attackSprite, this.game.input));
            entity.components.add(new InputComponent(this.game.input));
            entity.components.add(new PhysicsComponent(body, this.foo));

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
            var now = _.now();

            // TODO This should not be done
            worldState.timestamp = now;
            this._stateHistory.snapshot(worldState);

            this._lastSyncAt = now;
        }
        /**
         * Event handler for when a player leaves.
         * @method client.PlayState#onPlayerLeave
         * @param {string} id - Player entity identifier.
         */
        , onPlayerLeave: function (entityId) {
            this.log('player left', entityId);
            this.entities.remove(entityId);
        }
        /**
         * Updates the logic for this game.
         * @method client.PlayState#update
         * @param {Phaser.Game} game - Game instance.
         */
        , update: function(game) {
            var now = _.now()
                , elapsed = (now - this._lastTickAt) / 1000;

            this.updateWorldState();
            this.updateEntities(elapsed);
            this.updatePing();
            this.updateTimeLeft();
            this.updateStats();
            this.updateBannerCount();
            this.updatePlayerCount();
            this.updatePoints();

            this.entityGroup.sort('y', Phaser.Group.SORT_ASCENDING);

            this._lastTickAt = now;
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
                this._pingText.text = 'ping: ' + ping + ' ms';
                primus.emit('ping', {timestamp: now});
                this._pingSentAt = now;
            }
        }
        /**
         * Updates the time left text.
         * @method client.PlayState#updateTimeLeft
         */
        , updateTimeLeft: function() {
            var timeLeftSec = config.gameLengthSec - Math.round(this._runTimeSec);
            this._runTimeText.text = 'time left: ' + timeLeftSec + ' sec';
        }
        /**
         * Updates the player statistics text.
         * @method client.PlayState#updateStats
         */
        , updateStats: function() {
            if (this.player) {
                var stats = this.player.attrs.get(['kills', 'deaths']);
                this._statsText.text = 'kills: ' + stats.kills + ' / deaths: ' + stats.deaths;
            }
        }
        /**
         * Updates the banners text.
         * @method client.PlayState#updateBannerCount
         */
        , updateBannerCount: function() {
            this._bannerText.text = 'banners: ' + this._teamBanners + ' / ' + this._totalBanners;
        }
        /**
         * Updates the players online text.
         * @method client.PlayState#updatePlayerCount
         */
        , updatePlayerCount: function() {
            this._playerText.text = 'players online: ' + this._totalPlayers;
        }
        /**
         * Updates the points text.
         * @method client.PlayState#updatePoints
         */
        , updatePoints: function() {
            if (this.player) {
                this._pointsText.text = 'points: ' + this.player.attrs.get('points');
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
                    , playerTeam = this.player.attrs.get('team')
                    , previousState = this._stateHistory.previous()
                    , unprocessed = new List(this.entities.keys())
                    , factor, state, entity, sprite, body;

                this._runTimeSec = worldState.runTimeSec;
                this._teamBanners = worldState.banners[playerTeam].length;
                this._totalBanners = worldState.totalBanners;
                this._totalPlayers = worldState.totalPlayers;

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

                _.forOwn(worldState.entities, function(state, entityId) {
                    entity = this.entities.get(entityId);

                    // if the entity does not exist, we need to create it
                    if (!entity) {
                        this.log('creating new entity', state);
                        entity = this.createEntity(state);
                        sprite = this.entityGroup.create(state.attrs.x, state.attrs.y, state.attrs.image);
                        body = new Body(state.key, entity);

                        // all entities should be synchronized
                        entity.components.add(new SyncComponent());
                        entity.components.add(new PhysicsComponent(body, this.foo));

                        switch (state.key) {
                            case 'player':
                                entity.components.add(new PlayerComponent(sprite));
                                break;
                            case 'banner':
                                entity.components.add(new BannerComponent(sprite));
                                break;
                            default:
                                break;
                        }

                        this.entities.add(entityId, entity);
                    }

                    entity.sync(state.attrs);

                    unprocessed.remove(entityId);
                }, this);

                unprocessed.each(function(entityId) {
                    this.log('removing entity', entityId);
                    this.entities.remove(entityId);
                }, this);
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
                        */
                        worldState.entities[id] = entityState;
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
            return new Entity(data, config);
        }
        /**
         * Renders the state.
         * @method client.PlayState#render
         * @param {Phaser.Game} game - Game instance.
         */
        , render: function(game) {
            if (DEBUG) {
                // TODO implement visual debugging
            }
        }
        /**
         * Logs the a message to the console.
         */
        , log: function() {
             if (DEBUG && typeof console !== 'undefined') {
                 console.log.apply(console, arguments);
             }
         }
    });

    // create the actual game
    var game = new Phaser.Game(
        config.canvasWidth
        , config.canvasHeight
        , Phaser.AUTO
        , 'game'
        , null/* state */
        , false/* transparent */
        , false/* antialias */
    );

    game.state.add('play', new PlayState(), true/* autostart */);
}

module.exports = {
    run: run
};

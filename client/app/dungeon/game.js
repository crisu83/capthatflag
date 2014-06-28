define([
    'phaser'
    , 'shared/utils'
    , 'dungeon/entity'
    , 'dungeon/components/actor'
    , 'dungeon/components/input'
], function (Phaser, utils, Entity, ActorComponent, InputComponent) {
    'use strict';

    // runs the game
    function run(socket, config) {
        console.log('creating client', config);

        // gameplay state class
        var GameplayState = utils.inherit(Phaser.State, {
            entities: null
            // constructor
            , constructor: function() {
                this.entities = {};
            }
            // loads assets
            , preload: function(game) {
                console.log('loading assets ...');

                game.load.tilemap(config.mapKey, null, config.mapData, config.mapType);
                game.load.image(config.mapImage, 'static/' + config.mapSrc);

                game.load.image('player-male', 'static/assets/images/sprites/player/male.png');
                game.load.image('player-female', 'static/assets/images/sprites/player/female.png');
            }
            // creates the game
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
                socket.on('player.create', this.onPlayerCreate.bind(this));
                socket.on('player.leave', this.onPlayerLeave.bind(this));
                socket.on('client.sync', this.onSync.bind(this));

                // let the server know that client is ready
                socket.emit('client.ready');
            }
            // event handler for creating the player
            , onPlayerCreate: function(playerState) {
                console.log('creating player', playerState);

                var entity = new Entity(socket, playerState)
                    , sprite = this.game.add.sprite(playerState.x, playerState.y, playerState.image)
                    , physics = entity.getAttr('physics');

                if (physics >= 0) {
                    this.game.physics.enable(sprite, physics);
                    sprite.physicsBodyType = physics;
                    sprite.body.collideWorldBounds = true;
                    sprite.body.immovable = true;
                }

                entity.addComponent(new ActorComponent(sprite));
                entity.addComponent(new InputComponent(this.game.input));

                this.entities[playerState.id] = entity;
            }
            // event handler for synchronizing
            , onSync: function(worldState) {
                console.log('updating world state', worldState);

                if (this.player) {
                    var entityState, entity;
                    for (var i = 0; i < worldState.length; i++) {
                        entityState = worldState[i];

                        // if the entity does not exist, we need to create it
                        if (!this.entities[entityState.id]) {
                            this.entities[entityState.id] = this.createEntity(entityState);
                        } else {
                            entity = this.entities[entityState.id];
                            entity.sync(entityState);
                        }
                    }
                }
            }
            // creates an entity from a serialized entity
            , createEntity: function(entityState) {
                var entity = new Entity(socket, entityState)
                    , sprite = this.game.add.sprite(entityState.x, entityState.y, entityState.image)
                    , physics = entity.getAttr('physics');

                if (physics >= 0) {
                    this.game.physics.enable(sprite, physics);
                    sprite.physicsBodyType = physics;
                    sprite.body.collideWorldBounds = true;
                    sprite.body.immovable = true;
                }

                entity.addComponent(new ActorComponent(sprite));

                return entity;
            }
            // event handler for when a player leaves
            , onPlayerLeave: function (id) {
                console.log('player left', id);

                if (this.entities[id]) {
                    var player = this.entities[id];
                    delete this.entities[id];
                    player.die();
                }
            }
            // updates game logic
            , update: function(game) {
                // todo: fix collision so that players cannot overlap each other

                // enable collision between players
                //game.physics.arcade.collide(this.player.sprite, this.playerGroup);

                // update entities
                for (var id in this.entities) {
                    if (this.entities.hasOwnProperty(id)) {
                        this.entities[id].update(game.time.elapsed);
                    }
                }
            }
        });

        // create the actual game
        var game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO);
        game.state.add('gameplay', new GameplayState(), true/* autostart */);
    }

    return {
        run: run
    };
});

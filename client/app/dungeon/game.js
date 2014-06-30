define([
    'phaser'
    , 'shared/utils'
    , 'shared/entityHashmap'
    , 'app/entity'
    , 'dungeon/components/actor'
    , 'dungeon/components/input'
], function (Phaser, utils, EntityHashmap, Entity, ActorComponent, InputComponent) {
    'use strict';

    // runs the game
    function run(socket, config) {
        console.log('creating client', config);

        // gameplay state class
        var GameplayState = utils.inherit(Phaser.State, {
            entities: null
            // constructor
            , constructor: function() {
                this.entities = new EntityHashmap();
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

                // let the server know that client is ready
                socket.emit('client.ready');
            }
            // event handler for creating the player
            , onPlayerCreate: function(playerState) {
                console.log('creating player', playerState);

                var entity = new Entity(socket, playerState)
                    , sprite = this.game.add.sprite(playerState.x, playerState.y, playerState.image)
                    , physics = entity.attrs.get('physics');

                if (physics >= 0) {
                    this.game.physics.enable(sprite, physics);
                    sprite.physicsBodyType = physics;
                    sprite.body.collideWorldBounds = true;
                    sprite.body.immovable = true;
                }

                entity.components.add(new ActorComponent(sprite));
                entity.components.add(new InputComponent(this.game.input));

                this.entities.add(playerState.id, entity);

                // now we are ready to synchronization the world with the server
                socket.on('client.sync', this.onSync.bind(this));
            }
            // event handler for synchronizing
            , onSync: function(worldState) {
                var entityState, entity, sprite, physics;
                for (var i = 0; i < worldState.length; i++) {
                    entityState = worldState[i];
                    entity = this.entities.get(entityState.id);

                    // if the entity does not exist, we need to create it
                    if (!entity) {
                        console.log('creating new entity', entityState);
                        entity = new Entity(socket, entityState);
                        sprite = this.game.add.sprite(entityState.x, entityState.y, entityState.image);
                        physics = entity.attrs.get('physics');

                        if (physics >= 0) {
                            this.game.physics.enable(sprite, physics);
                            sprite.physicsBodyType = physics;
                            sprite.body.collideWorldBounds = true;
                            sprite.body.immovable = true;
                        }

                        entity.components.add(new ActorComponent(sprite));

                        this.entities.add(entityState.id, entity);
                    }

                    // synchronize the state of the entity
                    entity.sync(entityState);
                }
            }
            // event handler for when a player leaves
            , onPlayerLeave: function (id) {
                console.log('player left', id);

                var player = this.entities.get(id);
                if (player) {
                    player.die();
                }
            }
            // updates game logic
            , update: function(game) {
                // todo: add collision detection

                var elapsed = game.time.elapsed;

                this.entities.update(elapsed);
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

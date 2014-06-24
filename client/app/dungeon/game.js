define([
    'phaser'
    , 'shared/utils'
    , 'dungeon/objects/player'
    , 'dungeon/components/input'
    , 'shared/components/io'
    , 'shared/components/sprite'
], function (Phaser, utils, Player, InputComponent, IoComponent, SpriteComponent) {
    'use strict';

    // runs the game
    function run(socket, config) {
        console.log('creating client', config);

        // gameplay state class
        var GameplayState = utils.inherit(Phaser.State, {
            playerId: null
            , entities: null
            // constructor
            , constructor: function() {
                this.entities = {};
            }
            // loads assets
            , preload: function(game) {
                console.log('loading assets ...');

                game.load.tilemap(config.mapKey, null, config.mapData, config.mapType);
                game.load.image(config.mapImage, 'static/' + config.mapSrc);

                game.load.image('male', 'static/assets/images/sprites/player/male.png');
                game.load.image('female', 'static/assets/images/sprites/player/female.png');
            }
            // creates the game
            , create: function(game) {
                console.log('creating game ...');

                var self = this
                    , map, layer;

                // define the world bounds
                game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

                // set the background color for the stage
                game.stage.backgroundColor = '#000';

                // start the physics system
                //game.physics.startSystem(Phaser.Physics.ARCADE);

                map = game.add.tilemap(config.mapKey);
                map.addTilesetImage(config.mapKey, config.mapImage);
                layer = map.createLayer(config.mapLayer);
                layer.resizeWorld();

                socket.on('client.entitySpawn', function(entityStates) {
                    console.log('spawning entities', entityStates);

                    var entityState, sprite, entity;
                    for (var id in entityStates) {
                        if (entityStates.hasOwnProperty(id)) {
                            entityState = entityStates[id];
                            sprite = game.add.sprite(entityState.x, entityState.y, entityState.image);

                            game.physics.enable(sprite, Phaser.Physics.ARCADE);
                            sprite.physicsBodyType = Phaser.Physics.ARCADE;
                            sprite.body.collideWorldBounds = true;
                            sprite.body.immovable = true;

                            entity = new Player();
                            entity.id = entityState.id;
                            entity.addComponent(new IoComponent(socket));
                            entity.addComponent(new SpriteComponent(sprite));

                            self.entities[entityState.id] = entity;
                        }
                    }
                });

                socket.on('client.playerCreate', function(playerState) {
                    console.log('creating player', playerState);

                    var sprite, player, cursorKeys;

                    sprite = game.add.sprite(playerState.x, playerState.y, playerState.image);

                    game.physics.enable(sprite, Phaser.Physics.ARCADE);
                    sprite.physicsBodyType = Phaser.Physics.ARCADE;
                    sprite.body.collideWorldBounds = true;
                    sprite.body.immovable = true;

                    cursorKeys = game.input.keyboard.createCursorKeys();

                    player = new Player();
                    player.id = playerState.id;
                    player.addComponent(new IoComponent(socket));
                    player.addComponent(new SpriteComponent(sprite));
                    player.addComponent(new InputComponent(cursorKeys));

                    self.entities[playerState.id] = player;
                });

                socket.on('client.playerJoin', function(playerState) {
                    console.log('player joined', playerState);

                    var sprite, player;

                    sprite = game.add.sprite(playerState.x, playerState.y, playerState.image);

                    game.physics.enable(sprite, Phaser.Physics.ARCADE);
                    sprite.physicsBodyType = Phaser.Physics.ARCADE;
                    sprite.body.collideWorldBounds = true;
                    sprite.body.immovable = true;

                    player = new Player();
                    player.id = playerState.id;
                    player.addComponent(new IoComponent(socket));
                    player.addComponent(new SpriteComponent(sprite));

                    self.entities[playerState.id] = player;
                });

                // event handler for when a player moves
                socket.on('client.entityMove', function (entityState) {
                    console.log('entity moved', entityState);

                    if (self.entities[entityState.id]) {
                        var entity, sprite;
                        entity = self.entities[entityState.id];
                        sprite = entity.getComponent('sprite');
                        sprite.setPosition(entityState.x, entityState.y);
                    }
                });

                // event handler for when a player quits the game
                socket.on('client.playerLeave', function (id) {
                    console.log('player left', id);

                    if (self.entities[id]) {
                        var player = self.entities[id];
                        delete self.entities[id];
                        player.die();
                    }
                });

                // let the server know that client is ready
                socket.emit('client.ready');
            }
            // updates game logic
            , update: function(game) {
                // todo: fix collision so that players cannot overlap each other

                /*
                // enable collision between players
                game.physics.arcade.collide(this.player.sprite, this.playerGroup);
                */

                // update entities
                for (var id in this.entities) {
                    if (this.entities.hasOwnProperty(id)) {
                        this.entities[id].update(game);
                    }
                }
            }
            // todo: move this logic to a factory (or similar)
            // creates a new player from the given state
            , createPlayerFromState: function(playerState, game) {
                var sprite, player;

                sprite = game.add.sprite(
                    playerState.x
                    , playerState.y
                    , playerState.image
                );

                game.physics.enable(sprite, Phaser.Physics.ARCADE);

                // todo: move this into the sprite component (show how)
                sprite.physicsBodyType = Phaser.Physics.ARCADE;
                sprite.body.collideWorldBounds = true;
                sprite.body.immovable = true;

                player = new Player();
                player.addComponent(new IoComponent(socket));
                player.addComponent(new SpriteComponent(sprite));

                return player;
            }
        });

        // create the actual game
        var game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO);
        game.state.add('gameplay', new GameplayState(socket), true/* autostart */);
    }

    return {
        run: run
    };
});

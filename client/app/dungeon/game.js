define([
    'phaser'
    , 'shared/utils'
    , 'dungeon/objects/player'
    , 'dungeon/components/input'
    , 'dungeon/components/io'
    , 'dungeon/components/sprite'
], function (Phaser, utils, Player, InputComponent, IoComponent, SpriteComponent) {
    'use strict';

    // runs the game
    function run(socket, config, debug) {
        console.log('running game with config', config);

        // gameplay state class
        var GameplayState = utils.inherit(Phaser.State, {
            player: null
            , players: null
            , playerGroup: null
            // constructor
            , constructor: function() {
                this.players = {};
            }
            // loads assets
            , preload: function(game) {
                console.log('loading game assets ...');

                // note that if you are running a local server it is possible
                // that the assets have not been loaded when running game.create
                // which might cause some confusion at times

                // todo: move the logic below somewhere else

                /*
                this.player = new Player();
                this.player.clientId = config.clientId;
                */

                // event handler for loading the map
                socket.on('room.mapLoad', function(mapConfig) {
                    console.log('loading map', mapConfig);

                    game.load.tilemap(
                        mapConfig.tilesetKey
                        , mapConfig.tilesetUrl
                        , mapConfig.tilesetData
                        , Phaser.Tilemap.TILED_JSON
                    );

                    game.load.image(
                        mapConfig.imageKey
                        , 'static/assets/images/tilemaps/' + mapConfig.imageFilename
                    );
                });

                game.load.image('male', 'static/assets/images/sprites/player/male.png');
                game.load.image('female', 'static/assets/images/sprites/player/female.png');

                console.log('sending event game.load to server');

                // let the server know that the game is loading
                socket.emit('game.load');
            }
            // creates the game
            , create: function(game) {
                console.log('creating game ...');

                var self = this;

                // event handler for creating the tilemap
                socket.on('room.mapCreate', function(mapConfig) {
                    console.log('creating map', mapConfig);

                    var map, layer;
                    map = game.add.tilemap(mapConfig.tilesetKey);
                    map.addTilesetImage(mapConfig.tilesetKey, mapConfig.imageKey);
                    layer = map.createLayer(mapConfig.tilesetLayer);
                    layer.resizeWorld();
                });

                console.log('sending event game.create to server');

                // let the server know that client has been created
                socket.emit('game.create');

                // define the world bounds
                game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

                // set the background color for the stage
                game.stage.backgroundColor = '#000';

                // start the physics system
                game.physics.startSystem(Phaser.Physics.ARCADE);

                /*
                var sprite, cursorKeys;

                // todo: enable the player to choose the appearance

                // create the player sprite and move it to a random position.
                sprite = game.add.sprite(
                    game.world.randomX
                    , game.world.randomY
                    , Math.round(Math.random()) === 0 ? 'male' : 'female'
                );

                game.physics.enable(sprite, Phaser.Physics.ARCADE);

                // todo: move this into the sprite component (show how)
                sprite.physicsBodyType = Phaser.Physics.ARCADE;
                sprite.body.collideWorldBounds = true;
                sprite.body.immovable = true;

                cursorKeys = game.input.keyboard.createCursorKeys();

                // add components to the player
                this.player.addComponent(new InputComponent(cursorKeys));
                this.player.addComponent(new IoComponent(socket));
                this.player.addComponent(new SpriteComponent(sprite));


                // create a sprite group for players
                this.playerGroup = game.add.group();

                // lock the camera on the player
                game.camera.follow(this.player.sprite, Phaser.Camera.FOLLOW_LOCKON);

                // event handler for when the game state is initialized
                socket.on('room.mapInitialize', function (playerStates) {
                    console.log('initializing map ...', playerStates);

                    var i, playerState, player;
                    for (i = 0; i < playerStates.length; i++) {
                        playerState = playerStates[i];
                        player = self.createPlayerFromState(playerState, game);
                        self.players[playerState.clientId] = player;
                    }
                });

                // event handler for when a new player joins the game
                socket.on('room.playerJoin', function (playerState) {
                    console.log('player joined', playerState);

                    var player = self.createPlayerFromState(playerState, game);
                    self.players[playerState.clientId] = player;
                });

                // event handler for when a player moves
                socket.on('room.playerMove', function (playerState) {
                    if (self.players[playerState.clientId]) {
                        console.log('player moved', playerState);

                        var player, sprite;
                        player = self.players[playerState.clientId];
                        sprite = player.getComponent('sprite');
                        sprite.setPosition(playerState.x, playerState.y);
                    }
                });

                // event handler for when a player quits the game
                socket.on('room.playerQuit', function (clientId) {
                    if (self.players[clientId]) {
                        console.log('player quit', clientId);

                        var player = self.players[clientId];
                        delete self.players[clientId];
                        player.die();
                    }
                });

                // let the server know of the player
                socket.emit('room.playerJoin', this.player.toJSON());
                */
            }
            // updates game logic
            , update: function(game) {
                // todo: fix collision so that players cannot overlap each other

                /*
                // enable collision between players
                game.physics.arcade.collide(this.player.sprite, this.playerGroup);

                // update player logic
                this.player.update(game);
                */
            }
            // todo: move this logic to a factory (or similar)
            // creates a new player from the given state
            , createPlayerFromState: function(playerState, game) {
                var sprite, player;

                sprite = this.playerGroup.create(
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
        var game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO, 'game');
        game.state.add('gameplay', new GameplayState(socket));
        game.state.start('gameplay');
    }

    return {
        run: run
    };
});

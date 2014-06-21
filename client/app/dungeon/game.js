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
    function run(socket, config) {
        // create the "gameplay" state
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

                /*
                socket.on('game.loadTilemap', function(tilemap) {
                    game.load.tilemap(tilemap.name, null, tilemap.data, tilemap.type);
                    game.load.image(tilemap.name, tilemap.image);
                });
                */

                game.load.tilemap(
                    'dungeon'
                    , 'static/assets/maps/dungeon.json'
                    , null,
                    Phaser.Tilemap.TILED_JSON
                );

                game.load.image('dungeon', 'static/assets/images/tiles/dungeon.png');
                
                game.load.image('male', 'static/assets/images/sprites/player/male.png');
                game.load.image('female', 'static/assets/images/sprites/player/female.png');

                // create the player object
                this.player = new Player();
                this.player.preload(game);

                console.log('done');
            }
            // creates the game
            , create: function(game) {
                console.log('creating game ...');

                // start the physics system
                game.physics.startSystem(Phaser.Physics.ARCADE);

                // define the world bounds
                game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

                // set the background color for the stage
                game.stage.backgroundColor = '#000';

                var map, layer, sprite, cursorKeys;

                // set up our dungeon
                map = game.add.tilemap('dungeon')
                map.addTilesetImage('dungeon', 'dungeon');
                layer = map.createLayer('Floor1');
                layer.resizeWorld();

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

                // let the server know of the player
                socket.emit('player.join', this.player.toJSON());

                // create a sprite group for players
                this.playerGroup = game.add.group();

                // lock the camera on the player
                game.camera.follow(this.player.sprite, Phaser.Camera.FOLLOW_LOCKON);

                console.log('done');

                // initialize event handlers
                this.initEventHandlers(game);
            }
            // sets up event handlers for the game
            , initEventHandlers: function(game) {
                console.log('initializing event handlers ...');

                var self = this;

                // assign the client id to the player
                socket.on('client.assignId', function (clientId) {
                    self.player.clientId = clientId;
                });

                // event handler for when the game state is initialized
                socket.on('client.initializeState', function (playerStates) {
                    console.log('initializing game state ...', playerStates);

                    var i, playerState, player;
                    for (i = 0; i < playerStates.length; i++) {
                        playerState = playerStates[i];
                        player = self.createPlayerFromState(playerState, game);
                        self.players[playerState.clientId] = player;
                    }

                    console.log('done');
                });

                // event handler for when a new player joins the game
                socket.on('player.join', function (playerState) {
                    console.log('player joined', playerState);

                    var player = self.createPlayerFromState(playerState, game);
                    self.players[playerState.clientId] = player;
                });

                // event handler for when a player moves
                socket.on('player.move', function (playerState) {
                    if (self.players[playerState.clientId]) {
                        console.log('player moved', playerState);

                        var player, sprite;
                        player = self.players[playerState.clientId];
                        sprite = player.getComponent('sprite');
                        sprite.setPosition(playerState.x, playerState.y);
                    }
                });

                // event handler for when a player quits the game
                socket.on('player.quit', function (clientId) {
                    if (self.players[clientId]) {
                        console.log('player quit', clientId);

                        var player = self.players[clientId];
                        delete self.players[clientId];
                        player.die();
                    }
                });

                console.log('done');
            }
            // updates game logic
            , update: function(game) {
                // todo: fix collision so that players cannot overlap each other

                // enable collision between players
                game.physics.arcade.collide(this.player.sprite, this.playerGroup);

                // update player logic
                this.player.update(game);
            }
            // todo: move this logic to a factory (or similar)
            // creates a new player
            , createPlayer: function() {
                var player = new Player();
                player.socket = this.socket;
                return player;
            }
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

                player = this.createPlayer(sprite, game);
                player.addComponent(new IoComponent(socket));
                player.addComponent(new SpriteComponent(sprite));

                return player;
            }
        });

        // create the actual game
        var game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO);
        game.state.add('gameplay', new GameplayState(socket));
        game.state.start('gameplay');
    }

    return {
        run: run
    };
});

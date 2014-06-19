define([
    'phaser'
    , 'shared/utils'
    , 'dungeon/objects/player'
], function (Phaser, utils, Player) {
    'use strict';

    // runs the game
    function run(socket, config) {
        // create the "gameplay" state
        var GameplayState = utils.inherit(Phaser.State, {
            socket: null
            , cursorKeys: null
            , player: null
            , players: {}
            , playerGroup: null
            // constructor
            , constructor: function(socket) {
                this.socket = socket;
            }
            // loads assets
            , preload: function(game) {
                console.log('loading game assets ...');

                // create the player object
                this.player = new Player();
                this.player.socket = this.socket;
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

                // create the player sprite and move it to a random position.
                var sprite = game.add.sprite(
                        game.world.randomX
                        , game.world.randomY
                        , Math.round(Math.random()) === 0 ? 'male' : 'female'
                    );

                // configure the player sprite
                game.physics.enable(sprite, Phaser.Physics.ARCADE);

                // set the player sprite and run creation logic
                this.player.setSprite(sprite);
                this.player.create(game);

                // let the server know of the player
                this.socket.emit('player.join', this.player.toJSON());

                // create a sprite group for players
                this.playerGroup = game.add.group();

                // lock the camera on the player
                game.camera.follow(this.player.sprite, Phaser.Camera.FOLLOW_LOCKON);

                // create cursor keys to be able to handle user input
                this.cursorKeys = game.input.keyboard.createCursorKeys();

                console.log('done');

                // initialize event handlers
                this.initEventHandlers(game);
            }
            , update: function(game) {
                // todo: fix collision so that players cannot overlap each other

                // enable collision between players
                game.physics.arcade.collide(this.player.sprite, this.playerGroup);

                // handle the user input
                if (this.cursorKeys.up.isDown) {
                    this.player.sprite.body.velocity.y = -this.player.runSpeed;
                }
                if (this.cursorKeys.right.isDown) {
                    this.player.sprite.body.velocity.x = this.player.runSpeed;
                }
                if (this.cursorKeys.down.isDown) {
                    this.player.sprite.body.velocity.y = this.player.runSpeed;
                }
                if (this.cursorKeys.left.isDown) {
                    this.player.sprite.body.velocity.x = -this.player.runSpeed;
                }

                // reset velocities when corresponding cursor keys are released
                if (this.cursorKeys.left.isUp && this.cursorKeys.right.isUp) {
                    this.player.sprite.body.velocity.x = 0;
                }
                if (this.cursorKeys.up.isUp && this.cursorKeys.down.isUp) {
                    this.player.sprite.body.velocity.y = 0;
                }

                this.player.update(game);
            }
            // sets up event handlers for the game
            , initEventHandlers: function(game) {
                console.log('initializing event handlers ...');

                var self = this;

                // assign the client id to the player
                this.socket.on('client.assignId', function (clientId) {
                    self.player.clientId = clientId;
                });

                // event handler for when the game state is initialized
                this.socket.on('state.initialize', function (playerStates) {
                    console.log('initializing game state ...', playerStates);

                    var sprite, playerState, player;
                    for (var clientId in playerStates) {
                        if (playerStates.hasOwnProperty(clientId)) {
                            playerState = playerStates[clientId];

                            sprite = self.playerGroup.create(
                                playerState.x
                                , playerState.y
                                , playerState.image
                            );

                            game.physics.enable(sprite, Phaser.Physics.ARCADE);

                            player = new Player();
                            player.socket = self.socket;
                            player.setSprite(sprite);
                            self.players[clientId] = player;
                        }
                    }

                    console.log('done');
                });

                // event handler for when a new player joins the game
                this.socket.on('player.join', function (playerState) {
                    console.log('player joined', playerState);

                    var sprite = self.playerGroup.create(
                            playerState.x
                            , playerState.y
                            , playerState.image
                        )
                        , player;

                    game.physics.enable(sprite, Phaser.Physics.ARCADE);

                    player = new Player();
                    player.socket = self.socket;
                    player.setSprite(sprite);
                    self.players[playerState.clientId] = player;
                });

                // event handler for when a player moves
                this.socket.on('player.move', function (playerState) {
                    if (self.players[playerState.clientId]) {
                        console.log('player moved', playerState);

                        var player = self.players[playerState.clientId];
                        player.fromJSON(playerState);
                        player.sprite.x = playerState.x;
                        player.sprite.y = playerState.y;
                    }
                });

                // event handler for when a player quits the game
                this.socket.on('player.quit', function (clientId) {
                    if (self.players[clientId]) {
                        console.log('player quit', clientId);

                        var player = self.players[clientId];
                        delete self.players[clientId];
                        player.sprite.destroy();
                    }
                });

                console.log('done');
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

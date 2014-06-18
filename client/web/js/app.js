'use strict';

(function ($) {

    // globals
    var socket
        , game
        , playerGroup
        , cursorKeys
        , player
        , players = {}
        , config = {};

    // runs the game
    function runGame(afterCreate) {
        // create the game
        game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO, '', {
            // performs pre-loading for the game
            preload: function(game) {
                console.log('loading game assets ...');

                // pre-load sprite images
                game.load.image('male', 'static/images/male.png');
                game.load.image('female', 'static/images/female.png');

                console.log('done');
            }
            // creates the game
            , create: function(game) {
                console.log('creating game ...');

                game.physics.startSystem(Phaser.Physics.ARCADE);

                // define the world bounds
                game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

                var sprite = game.add.sprite(
                    game.world.randomX
                    , game.world.randomY
                    , Math.round(Math.random()) === 0 ? 'male' : 'female'
                );

                // create the player in a random position
                player = createPlayer(sprite);

                // create a sprite group for players
                playerGroup = game.add.group();

                // lock the camera on the player
                game.camera.follow(player.sprite, Phaser.Camera.FOLLOW_LOCKON);

                cursorKeys = game.input.keyboard.createCursorKeys();

                console.log('done');

                // invoke the after create callback
                afterCreate();
            }
            // updates game logic
            , update: function(game) {
                // enable collision between players
                game.physics.arcade.collide(player.sprite, playerGroup);

                // handle the user input
                var speed = 100;

                if (cursorKeys.up.isDown) {
                    player.sprite.body.velocity.y = -speed;
                }
                if (cursorKeys.right.isDown) {
                    player.sprite.body.velocity.x = speed;
                }
                if (cursorKeys.down.isDown) {
                    player.sprite.body.velocity.y = speed
                }
                if (cursorKeys.left.isDown) {
                    player.sprite.body.velocity.x = -speed;
                }
                if (cursorKeys.left.isUp && cursorKeys.right.isUp) {
                    player.sprite.body.velocity.x = 0;
                }
                if (cursorKeys.up.isUp && cursorKeys.down.isUp) {
                    player.sprite.body.velocity.y = 0;
                }

                // update the state with the correct position
                player.x = player.sprite.body.x;
                player.y = player.sprite.body.y;

                // let the server know that we moved
                if (player.sprite.body.velocity.x !== 0 || player.sprite.body.velocity.y !== 0) {
                    socket.emit('player move', player.toJSON());
                }
            }
        });
    }

    // creates a new player
    function createPlayer(sprite) {
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.physicsBodyType = Phaser.Physics.ARCADE;
        sprite.body.collideWorldBounds = true;
        sprite.body.immovable = true;

        var player = new Player(sprite.x, sprite.y, sprite.key);
        player.sprite = sprite;

        return player;
    }

    // connects to the game server and sets up event handlers
    function connectToSocket(data) {
        console.log('connecting to server ...');

        socket = io.connect('', {query: 'token=' + data.token});

        // event handler for when the player is connected to the server
        socket.on('connect', function () {
            console.log('connection established');
        });

        // event handler for configuring the client
        socket.on('configure', function (configState) {
            console.log('configuring client', configState)

            config = configState;

            runGame(function() {
                // let the server know of the player
                socket.emit('player join', player.toJSON());

                // assign the client id to the player
                socket.on('assign client id', function (clientId) {
                    player.clientId = clientId;
                });

                // event handler for when the game state is initialized
                socket.on('init state', function (playerStates) {
                    console.log('initializing game state ...', playerStates);

                    var sprite, playerState, player;
                    for (var clientId in playerStates) {
                        playerState = playerStates[clientId];
                        sprite = playerGroup.create(
                            playerState.x
                            , playerState.y
                            , playerState.image
                        );
                        player = createPlayer(sprite);
                        players[clientId] = player;
                    }

                    console.log('done');
                });

                // event handler for when a new player joins the game
                socket.on('player join', function (playerState) {
                    console.log('player joined', playerState);

                    var sprite = playerGroup.create(
                        playerState.x
                        , playerState.y
                        , playerState.image
                    );
                    var player = createPlayer(sprite);
                    players[playerState.clientId] = player;
                });

                // event handler for when a player moves
                socket.on('player move', function (playerState) {
                    if (players[playerState.clientId]) {
                        console.log('player moved', playerState);

                        var player = players[playerState.clientId];
                        player.fromJSON(playerState);
                        player.sprite.x = playerState.x;
                        player.sprite.y = playerState.y;
                    }
                });

                // event handler for when a player quits the game
                socket.on('player quit', function (clientId) {
                    if (players[clientId]) {
                        console.log('player quit', clientId);

                        var player = players[clientId];
                        delete players[clientId];
                        player.sprite.destroy();
                    }
                });
            });
        });
    }

    // perform authentication and connect to the server
    $.post('/auth')
        .done(connectToSocket);

})(jQuery);

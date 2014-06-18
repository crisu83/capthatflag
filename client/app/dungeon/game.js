define([
    'phaser'
    , 'dungeon/objects/player'
], function (Phaser, Player) {
    'use strict';

    // runs the game
    function run(socket, config) {
        // scope variables
        var playerGroup
            , cursorKeys
            , player
            , players = {};

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

        // performs pre-loading for the game
        function preload() {
            console.log('loading game assets ...');

            // pre-load sprite images
            game.load.image('male', 'static/images/male.png');
            game.load.image('female', 'static/images/female.png');

            console.log('done');
        }

        // creates the game
        function create() {
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

            // initialize event handlers
            initEventHandlers();
        }

        // sets up event handlers for the game
        function initEventHandlers() {
            console.log('initializing event handlers ...');

            // let the server know of the player
            socket.emit('player.join', player.toJSON());

            // assign the client id to the player
            socket.on('client.assignId', function (clientId) {
                player.clientId = clientId;
            });

            // event handler for when the game state is initialized
            socket.on('state.initialize', function (playerStates) {
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
            socket.on('player.join', function (playerState) {
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
            socket.on('player.move', function (playerState) {
                if (players[playerState.clientId]) {
                    console.log('player moved', playerState);

                    var player = players[playerState.clientId];
                    player.fromJSON(playerState);
                    player.sprite.x = playerState.x;
                    player.sprite.y = playerState.y;
                }
            });

            // event handler for when a player quits the game
            socket.on('player.quit', function (clientId) {
                if (players[clientId]) {
                    console.log('player quit', clientId);

                    var player = players[clientId];
                    delete players[clientId];
                    player.sprite.destroy();
                }
            });

            console.log('done');
        }

        // updates game logic
        function update() {
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

            // let the server know if we moved
            if (player.sprite.body.velocity.x !== 0
                || player.sprite.body.velocity.y !== 0) {
                socket.emit('player.move', player.toJSON());
            }
        }

        // create the actual game
        var game = new Phaser.Game(
            config.canvasWidth
            , config.canvasHeight
            , Phaser.AUTO
            , ''
            , {preload: preload, create: create, update: update}
        );
    }

    return {
        run: run
    }
});

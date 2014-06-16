(function ($) {

    // todo: some of the settings should be fetched from the server (i.e. tileSize)

    // globals
    var socket
        , playerGroup
        , cursorKeys
        , player
        , players = {}
        , config = {};

    // runs the game
    function runGame(afterCreate) {
        // create the game
        new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.AUTO, '', {
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

                // define the world bounds
                game.world.setBounds(0, 0, config.gameWidth, config.gameHeight);

                // create a sprite group for players
                playerGroup = game.add.group();

                // create the player in a random position
                player = createPlayer(
                    numberToTile(game.world.randomX)
                    , numberToTile(game.world.randomY)
                    , Math.round(Math.random()) === 0 ? 'male' : 'female'
                );

                // lock the camera on the player
                game.camera.follow(player.sprite, Phaser.Camera.FOLLOW_LOCKON);

                cursorKeys = game.input.keyboard.createCursorKeys();

                console.log('done');

                // invoke the after create callback
                afterCreate();
            }
            // updates game logic
            , update: function(game) {
                // todo: prevent players from overlapping

                // handle the user input
                handleInput(player);
            }
        });

        var inputInterval = 100
            , lastInputAt = null;

        // handles user input
        function handleInput(player) {
            // todo: figure out if phaser supports input intervals
            var now = new Date().getTime();

            if (!lastInputAt || now - inputInterval > lastInputAt) {
                var direction = null;

                if (cursorKeys.up.isDown) {
                    direction = 'up'
                } else if (cursorKeys.right.isDown) {
                    direction = 'right';
                } else if (cursorKeys.down.isDown) {
                    direction = 'down';
                } else if (cursorKeys.left.isDown) {
                    direction = 'left';
                }

                if (direction) {
                    // move the player to avoid issues with lag
                    // and let all other players know that the player moved
                    moveObject(player, direction);
                    socket.emit('player move', {direction: direction});
                }

                lastInputAt = now;
            }
        }
    }

    // moves an object in the given direction
    function moveObject(object, direction) {
        var x = object.x
            , y = object.y;

        if (direction === 'up') {
            y -= config.tileSize;
        } else if (direction === 'right') {
            x += config.tileSize;
        } else if (direction === 'down') {
            y += config.tileSize
        } else if (direction === 'left') {
            x -= config.tileSize
        } else {
            // do nothing for now
        }

        // ensure that the object remains within world bounds
        if (x < 0) {
            x = 0;
        } else if (x > config.gameWidth - config.tileSize) {
            x = config.gameWidth - config.tileSize;
        }
        if (y < 0) {
            y = 0;
        } else if (y > config.gameHeight - config.tileSize) {
            y = config.gameHeight - config.tileSize;
        }

        object.setPosition(x, y);
    }

    // creates a new player
    function createPlayer(x, y, image) {
        var player = new Player(x, y, image)
            , sprite = playerGroup.create(player.x, player.y, player.image);
        player.sprite = sprite;
        return player;
    }

    // create a new player from a state object
    function createPlayerFromState(playerState) {
        return createPlayer(
            playerState.x
            , playerState.y
            , playerState.image
            , playerState.clientId
        );
    }

    function numberToTile(number) {
        return Math.ceil((number + 1) / config.tileSize) * config.tileSize;
    }

    // connects to the game server and sets up event handlers
    function connect(data) {
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
            });
        });

        // event handler for when the game state is initialized
        socket.on('init state', function (playerStates) {
            console.log('initializing game state ...', playerStates);

            var clientId, playerState;
            for (clientId in playerStates) {
                playerState = playerStates[clientId];
                players[playerState.clientId] = createPlayerFromState(playerState);
            }

            console.log('done');
        });

        // event handler for when a new player joins the game
        socket.on('player join', function (playerState) {
            console.log('player joined', playerState);

            players[playerState.clientId] = createPlayerFromState(playerState);
        });

        // event handler for when a player moves
        socket.on('player move', function (playerState) {
            if (players[playerState.clientId]) {
                console.log('player moved', playerState);

                var player = players[playerState.clientId];
                player.setPosition(playerState.x, playerState.y);
            }
        });

        // event handler for correcting the player position
        socket.on('correct player position', function (playerState) {
            // correct the player position if it is different from the server
            if (player.x !== playerState.x || player.y !== playerState.y) {
                console.log('player position corrected', {
                    cx: player.x
                    , cy: player.y
                    , sx: playerState.x
                    , sy: playerState.y
                });

                player.setPosition(playerState.x, playerState.y)
            }
        })

        // event handler for when a player quits the game
        socket.on('player quit', function (clientId) {
            if (players[clientId]) {
                console.log('player quit', clientId);

                var player = players[clientId];
                delete players[clientId];
                player.sprite.destroy();
            }
        });
    }

    // perform authentication and connect to the server
    $.post('/auth').done(connect);

})(jQuery);

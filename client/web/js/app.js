(function ($) {

    // todo: some of the settings should be fetched from the server (i.e. tileSize)

    // globals
    var socket
        , playerGroup
        , cursorKeys
        , player
        , players = {}
        , config = {};

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
        var player = new Player(x, y, image);
        var sprite = playerGroup.create(player.x, player.y, player.image);
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
        socket = io.connect('', {query: 'token=' + data.token});

        // event handler for when the player is connected to the server
        socket.on('connect', function () {
            console.log('secure connection established');
        });

        // event handler for configuring the client
        socket.on('configure', function (configState) {
            console.log('configuring client', configState)

            config = configState;

            console.log(config.tileSize);

            player = createPlayer(
                numberToTile(game.world.randomX)
                , numberToTile(game.world.randomY)
                , Math.round(Math.random()) === 0 ? 'male' : 'female'
            );

            // let the other players know that the player joined
            socket.emit('join', player.toJSON());
        });

        // event handler for when the game state is initialized
        socket.on('init state', function (playerStates) {
            console.log('initializing game state', playerStates);

            var clientId, playerState;
            for (clientId in playerStates) {
                playerState = playerStates[clientId];
                players[playerState.clientId] = createPlayerFromState(playerState);
            }
        });

        // event handler for when a new player joins the game
        socket.on('join', function (playerState) {
            console.log('player joined', playerState);

            players[playerState.clientId] = createPlayerFromState(playerState);
        });

        // event handler for when a player moves
        socket.on('move', function (playerState) {
            if (players[playerState.clientId]) {
                console.log('player move', playerState);

                var player = players[playerState.clientId];
                player.setPosition(playerState.x, playerState.y);
            }
        });

        // event handler for correcting the player position
        socket.on('correct move', function (playerState) {
            // correct the player position if it is different from the server
            if (player.x !== playerState.x || player.y !== playerState.y) {
                console.log('correcting player position', {
                    cx: player.x
                    , cy: player.y
                    , sx: playerState.x
                    , sy: playerState.y
                });

                player.setPosition(playerState.x, playerState.y)
            }
        })

        // event handler for when a player quits the game
        socket.on('quit', function (clientId) {
            if (players[clientId]) {
                console.log('player quit', clientId);

                var player = players[clientId];
                delete players[clientId];
                player.sprite.destroy();
            }
        });
    }

    // create the actual game
    var game = new Phaser.Game(config.gameWidth, config.gameHeight, Phaser.AUTO, '', {
        preload: preload
        , create: create
        , update: update
    });

    // does pre-loading for the game
    function preload() {
        game.load.image('male', 'static/images/male.png');
        game.load.image('female', 'static/images/female.png');
    }

    // creates the game
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        playerGroup = game.add.group();
        playerGroup.enableBody = true;
        playerGroup.physicsBodyType = Phaser.Physics.ARCADE;

        cursorKeys = game.input.keyboard.createCursorKeys();

        $.post('/auth').done(connect);
    }

    // updates the game state
    function update() {
        if (player) {
            // todo: prevent players from overlapping

            // handle the user input
            handleInput(player);
        }
    }

    var inputInterval = 100
        , lastInputAt = null;

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
                socket.emit('move', {direction: direction});
            }

            lastInputAt = now;
        }
    }

})(jQuery);

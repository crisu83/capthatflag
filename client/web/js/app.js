(function ($) {

    // globals
    var socket
        , playerGroup
        , cursorKeys
        , player
        , players = {}
        , movementSpeed = 100
        , tileSize = 32;

    // moves a sprite in the given direction
    function moveSprite(sprite, direction) {
        if (direction === 'up') {
            sprite.y -= tileSize;
        } else if (direction === 'right') {
            sprite.x += tileSize;
        } else if (direction === 'down') {
            sprite.y += tileSize
        } else if (direction === 'left') {
            sprite.x -= tileSize
        } else {
            // do nothing for now
        }
    }

    // creates a new player
    function createPlayer(x, y, image, clientId) {
        var player = new Player(x, y, image);

        var sprite = playerGroup.create(player.x, player.y, player.image);
        sprite.body.collideWorldBounds = true;

        player.sprite = sprite;
        player.clientId = clientId;

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
        return Math.ceil((number + 1) / tileSize) * tileSize;
    }

    // connects to the game server and sets up event handlers
    function connect(data) {
        socket = io.connect('', {query: 'token=' + data.token});

        // event handler for when the player is connected to the server
        socket.on('connect', function () {
            console.log('secure connection established');

            player = createPlayer(
                numberToTile(game.world.randomX)
                , numberToTile(game.world.randomY)
                , Math.floor(Math.random() * 1) ? 'male' : 'female'
            );

            socket.emit('join', player.toJSON());
        });

        // event handler for when the game state is initialized
        socket.on('init', function (playerStates) {
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
            console.log('player move', playerState);

            if (players[playerState.clientId]) {
                var player = players[playerState.clientId];
                player.sprite.position.setTo(playerState.x, playerState.y);
            }
        });

        // event handler for when a player quits the game
        socket.on('quit', function (clientId) {
            console.log('player quit', clientId);

            if (players[clientId]) {
                var player = players[clientId];
                delete players[clientId];
                player.sprite.destroy();
            }
        });
    }

    // create the actual game
    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
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

    var inputInterval = 100 // 250ms
        , lastInputAt = null;

    // updates the game state
    function update() {
        if (player) {
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
                    moveSprite(player.sprite, direction);
                    socket.emit('move', {direction: direction});
                }

                lastInputAt = now;
            }
        }
    }

})(jQuery);

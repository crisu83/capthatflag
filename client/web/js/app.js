(function ($) {

    // globals
    var socket
        , playerGroup
        , cursorKeys
        , player
        , players = {};

    // returns a random integer between min and max
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // connects to the game server
    function connect(data) {
        socket = io.connect('', {query: 'token=' + data.token});

        function createPlayer(x, y, image, id) {
            var player = new Player(x, y, image, id);

            var sprite = playerGroup.create(player.x, player.y, player.image);
            sprite.body.immovable = true;
            sprite.body.collideWorldBounds = true;

            player.sprite = sprite;

            return player;
        }

        // event handler for when the player is connected to the server
        socket.on('connect', function () {
            console.log('secure connection established');

            player = createPlayer(
                game.world.randomX
                , game.world.randomY
                , random(0, 1) ? 'male' : 'female'
            );

            socket.emit('join', player.toJSON());
        });

        // event handler for when the game state is initialized
        socket.on('init', function (playerStates) {
            console.log('initializing game state', playerStates);

            var clientId, playerState;
            for (clientId in playerStates) {
                playerState = playerStates[clientId];
                players[playerState.id] = createPlayer(
                    playerState.x
                    , playerState.y
                    , playerState.image
                    , playerState.id
                );
            }
        });

        // event handler for when a new player joins the game
        socket.on('join', function (playerState) {
            console.log('player joined', playerState);

            players[playerState.id] = createPlayer(
                playerState.x
                , playerState.y
                , playerState.image
                , playerState.id
            );
        });

        // event handler for when a player moves
        socket.on('move', function (playerState) {
            console.log('player move', playerState);

            if (players[playerState.id]) {
                var player = players[playerState.id];
                player.sprite.position.setTo(state.x, state.y);
            }
        });

        // event handler for when a player quits the game
        socket.on('quit', function (id) {
            console.log('player quit', id);

            if (players[id]) {
                var player = players[id];
                delete players[id];
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

    // updates the game state
    function update() {
        if (cursorKeys.up.isDown) {
            socket.emit('move', {direction: 'up'});
        } else if (cursorKeys.right.isDown) {
            socket.emit('move', {direction: 'right'});
        } else if (cursorKeys.down.isDown) {
            socket.emit('move', {direction: 'down'});
        } else if (cursorKeys.left.isDown) {
            socket.emit('move', {direction: 'left'});
        } else {
            // do nothing for now ...
        }
    }

})(jQuery);

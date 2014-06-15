(function ($) {

    var socket
        , player
        , playerGroup
        , cursorKeys
        , playerState
        , otherPlayers = {};

    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function run(data) {
        socket = io.connect('', {query: 'token=' + data.token});

        socket.on('connect', function () {
            console.log('secure connection established');

            playerState = {
                x: game.world.randomX
                , y: game.world.randomY
                , image: random(0, 1) ? 'male' : 'female'
                , token: data.token
            };

            player = playerGroup.create(
                playerState.x
                , playerState.y
                , playerState.image
            );

            player.body.collideWorldBounds = true;

            socket.emit('join', playerState);
        });

        function addPlayer(state) {
            sprite = playerGroup.create(state.x, state.y, state.image);
            otherPlayers[state.token] = sprite;
        }

        socket.on('init', function (states) {
            console.log('initializing game state');

            for (var token in states) {
                addPlayer(states[token]);
            }
        });

        socket.on('join', function (state) {
            console.log('player joined', state.token);

            addPlayer(state);
        });

        socket.on('move', function (state) {
            if (otherPlayers[state.token]) {
                var sprite = otherPlayers[state.token];
                sprite.position.setTo(state.x, state.y);
            }
        });

        socket.on('quit', function (token) {
            console.log('player quit', token);

            if (otherPlayers[token]) {
                var sprite = otherPlayers[token];
                delete otherPlayers[token];
                sprite.destroy();
            }
        });
    }

    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
        preload: preload
        , create: create
        , update: update
    });

    function preload() {
        game.load.image('male', 'static/images/male.png');
        game.load.image('female', 'static/images/female.png');
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        playerGroup = game.add.group();
        playerGroup.enableBody = true;
        playerGroup.physicsBodyType = Phaser.Physics.ARCADE;

        cursorKeys = game.input.keyboard.createCursorKeys();

        $.post('/auth').done(run);
    }

    function update() {
        if (player) {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;

            if (cursorKeys.up.isDown) {
                player.body.velocity.y = -150;
            } else if (cursorKeys.right.isDown) {
                player.body.velocity.x = 150;
            } else if (cursorKeys.down.isDown) {
                player.body.velocity.y = 150;
            } else if (cursorKeys.left.isDown) {
                player.body.velocity.x = -150;
            } else {
                // do nothing for now ...
            }

            if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
                playerState.x = player.x;
                playerState.y = player.y;

                socket.emit('move', playerState);
            }
        }
    }

})(jQuery);

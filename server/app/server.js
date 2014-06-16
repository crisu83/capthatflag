var app = require('./app')
    , socketIo = require('socket.io')
    , jwt = require('socketio-jwt')
    , config = require('./config.json')
    , Player = require('../../client/web/js/player');

// create the server
var server = app.listen(config.port, function() {
    console.log('server started on port %d', config.port);
});

// initialize socket.io
var io = socketIo.listen(server);

// set up authorization
io.use(jwt.authorize({secret: config.secret, handshake: true}));

// whether to enable debugging
var debug = true;

// player storage, the real player state will be kept here
// (clientId => Player)
var players = {};

// event handler for when a client connects to the server
io.on('connection', function (socket) {
    console.log('- client \'%s\' connected', socket.decoded_token.id);

    // pass over the configuration to the client
    socket.emit('configure', {
        gameWidth: config.gameWidth
        , gameHeight: config.gameHeight
        , tileSize: config.tileSize
    });

    var clientId = socket.decoded_token.id
        , player = null;

    // event handler for when a player joining the game
    socket.on('join', function (playerState) {
        if (debug) {
            console.log('\tplayer join', clientId, playerState);
        }

        // create an array with the state of all existing players
        var playerStates = [];
        for (var id in players) {
            playerStates.push(players[id].toJSON());
        }

        // let the newly joined player know of other players
        socket.emit('init state', playerStates);

        // create the player on the server and save it in the store
        player = new Player(playerState.x, playerState.y, playerState.image);
        player.clientId = clientId;
        players[clientId] = player;

        // let other players know that the player joined
        socket.broadcast.emit('join', player.toJSON());
    });

    // moves an object on the server
    function moveObject(object, direction) {
        if (direction === 'up') {
            object.y -= config.tileSize;
        } else if (direction === 'right') {
            object.x += config.tileSize;
        } else if (direction === 'down') {
            object.y += config.tileSize;
        } else if (direction === 'left') {
            object.x -= config.tileSize;
        }

        if (object.x < 0) {
            object.x = 0;
        } else if (object.x > config.gameWidth - config.tileSize) {
            object.x = config.gameWidth - config.tileSize;
        }
        if (object.y < 0) {
            object.y = 0;
        } else if (object.y > config.gameHeight - config.tileSize) {
            object.y = config.gameHeight - config.tileSize;
        }
    }

    var actionInterval = 50
        , lastActionAt = null;

    // event handler for when a player moving
    socket.on('move', function (moveState) {
        var now = new Date().getTime();

        if (!lastActionAt || now - actionInterval > lastActionAt) {
            if (debug) {
                console.log('\tplayer move', clientId, moveState);
            }

            // move the player here in order to avoid cheating
            moveObject(player, moveState.direction);

            // let other clients know that the player moved
            socket.broadcast.emit('move', player.toJSON());

            // let the player know its correct position so that the position
            // can be corrected in case the server disagrees with the client
            // this could happen if the player tries to hack the client
            socket.emit('correct move', player.toJSON());

            lastActionAt = now;
        }
    });

    // event handler for when a client disconnects from the server
    socket.on('disconnect', function () {
        // remove the player from the store
        delete players[clientId];

        // let other clients know that the player quit
        socket.broadcast.emit('quit', clientId);

        console.log('- client \'%s\' disconnected', socket.decoded_token.id);
    });
});

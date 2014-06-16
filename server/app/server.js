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

function createPlayer(clientId, state) {
    var player = new Player(state.x, state.y, state.image);
    player.clientId = clientId;
    return player;
};

// whether to enable debugging
var debug = true;

// player storage, the real player state will be kept here
// (clientId => Player)
var players = {};

var gameWidth = 800
    , gameHeight = 600
    , tileSize = 32;

// event handler for when a client connects to the server
io.on('connection', function (socket) {
    console.log('- client \'%s\' connected', socket.decoded_token.id);

    var clientId = socket.decoded_token.id
        , player = null;

    // event handler for when a player joining the game
    socket.on('join', function (playerState) {
        if (debug) {
            console.log('\tplayer join', clientId, playerState);
        }

        var playerStates = [];

        for (var id in players) {
            playerStates.push(players[id].toJSON());
        }

        // let the newly joined player know of other existing players
        socket.emit('init', playerStates);

        // create the player on the server and save it in the store
        player = createPlayer(clientId, playerState);
        players[clientId] = player;

        // let other players know that the player joined
        socket.broadcast.emit('join', player.toJSON());
    });

    function moveObject(object, direction) {
        if (direction === 'up') {
            object.y -= tileSize;
        } else if (direction === 'right') {
            object.x += tileSize;
        } else if (direction === 'down') {
            object.y += tileSize;
        } else if (direction === 'left') {
            object.x -= tileSize;
        }

        if (object.x < 0) {
            object.x = 0;
        } else if (object.x > gameWidth - tileSize) {
            object.x = gameWidth - tileSize;
        }
        if (object.y < 0) {
            object.y = 0;
        } else if (object.y > gameHeight - tileSize) {
            object.y = gameHeight - tileSize;
        }
    }

    // event handler for when a player moving
    socket.on('move', function (moveState) {
        if (debug) {
            console.log('\tplayer move', clientId, moveState);
        }

        // move the player here in order to avoid cheating
        moveObject(player, moveState.direction);

        // let other clients know that the player moved
        socket.broadcast.emit('move', player.toJSON());
    });

    // event handler for when a client disconnects from the server
    socket.on('disconnect', function () {
        delete players[clientId];

        // let other clients know that the player quit
        socket.broadcast.emit('quit', clientId);

        console.log('- client \'%s\' disconnected', socket.decoded_token.id);
    });
});

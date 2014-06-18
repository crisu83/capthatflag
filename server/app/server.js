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
        canvasWidth: config.canvasWidth
        , canvasHeight: config.canvasHeight
        , gameWidth: config.gameWidth
        , gameHeight: config.gameHeight
        , tileSize: config.tileSize
    });

    var clientId = socket.decoded_token.id
        , player = new Player();

    // event handler for when a player joining the game
    socket.on('player join', function (playerState) {
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

        player.fromJSON(playerState);
        player.clientId = clientId;
        players[clientId] = player;

        // let other players know that the player joined
        socket.broadcast.emit('player join', player.toJSON());

        // pass the client id to the client
        socket.emit('assign client id', clientId);
    });

    // event handler for when a player moving
    socket.on('player move', function (playerState) {
        // validates a move from point a to point b
        function validateMove(sx, sy, dx, dy) {
            // todo: figure out how to validate the move
            return true; // for now all moves are valid
        }

        var oldState = player.toJSON();

        if (validateMove(oldState.x, oldState.y, playerState.x, playerState.y)) {
            player.fromJSON(playerState);
            socket.broadcast.emit('player move', player.toJSON());
        }
    });

    // event handler for when a client disconnects from the server
    socket.on('disconnect', function () {
        // remove the player from the store
        delete players[clientId];

        // let other clients know that the player quit
        socket.broadcast.emit('player quit', clientId);

        console.log('- client \'%s\' disconnected', socket.decoded_token.id);
    });
});

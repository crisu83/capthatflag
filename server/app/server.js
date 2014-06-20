/* jshint camelcase:false */

var app = require('./app')
    , socketIo = require('socket.io')
    , jwt = require('socketio-jwt')
    , uuid = require('node-uuid')
    , config = require('./config.json')
    , Player = require('./objects/player');

// create the server
var server = app.listen(config.port, function() {
    console.log('server started on port %d', config.port);
});

// initialize socket.io
var io = socketIo.listen(server);

// whether to enable debugging
var debug = true;

// player storage, the canonical player state will be kept here
// (clientId => Player)
var players = {};

// create a namespace for socket communication
var dungeon = io.of('/dungeon-game');

// set up authorization
dungeon.use(jwt.authorize({secret: config.secret, handshake: true}));

// generate a random room id
var roomId = uuid.v4();

// event handler for when a client connects to the server
dungeon.on('connection', function (socket) {
    // assign some scope variables
    var clientId = socket.decoded_token.id
        , player = new Player();

    // todo: add support for multiple socket rooms

    // join a room
    socket.join(roomId);

    console.log(
        '- client \'%s\' connected to room \'%s\''
        , socket.decoded_token.id
        , roomId
    );

    // let the client know to which room they have connected
    socket.emit('client.joinRoom', roomId);

    // event handler for when a client asks for its configuration
    socket.on('client.requestConfig', function () {
        // send the configuration back to the client
        socket.emit('client.configure', {
            canvasWidth: config.canvasWidth
            , canvasHeight: config.canvasHeight
            , gameWidth: config.gameWidth
            , gameHeight: config.gameHeight
            , tileSize: config.tileSize
        });
    });

    // event handler for when a player joining the game
    socket.on('player.join', function (playerState) {
        if (debug) {
            console.log('\tplayer join', clientId, playerState);
        }

        // create an array with the state of all existing players
        var playerStates = [];
        for (var id in players) {
            if (players.hasOwnProperty(id)) {
                playerStates.push(players[id].toJSON());
            }
        }

        // let the newly joined player know of other players
        socket.emit('state.initialize', playerStates);

        player.fromJSON(playerState);
        player.clientId = clientId;
        players[clientId] = player;

        // let other players know that the player joined
        socket.broadcast.emit('player.join', player.toJSON());

        // pass the client id to the client
        socket.emit('client.assignId', clientId);
    });

    // event handler for when a player moving
    socket.on('player.move', function (playerState) {
        // validates a move from point a to point b
        function validateMove(sx, sy, dx, dy) {
            // todo: figure out how to validate the move
            return true; // for now all moves are valid
        }

        var oldState = player.toJSON();

        if (validateMove(oldState.x, oldState.y, playerState.x, playerState.y)) {
            player.fromJSON(playerState);
            socket.broadcast.emit('player.move', player.toJSON());
        }
    });

    // event handler for when a client disconnects from the server
    socket.on('disconnect', function () {
        // remove the player from the store
        delete players[clientId];

        // let other clients know that the player quit
        socket.broadcast.emit('player.quit', clientId);

        console.log('- client \'%s\' disconnected', socket.decoded_token.id);
    });
});

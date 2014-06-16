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

function createPlayer(id, state) {
    return new Player(state.x, state.y, state.image, id);
};

// player storage, the real player state will be kept here
// (clientId => Player)
var players = {};

// event handler for when a client connects to the server
io.on('connection', function (socket) {
    console.log(' - client \'%s\' connected', socket.decoded_token.id);

    var clientId = socket.decoded_token.id;
    var player = null;

    // event handler for when a player joining the game
    socket.on('join', function (playerState) {
        console.log('\tplayer join', playerState);

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

    // event handler for when a player moving
    socket.on('move', function (moveState) {
        console.log('\tplayer move', moveState);
        // todo: perform move logic

        // let other clients know that the player moved
        socket.broadcast.emit('move', player.toJSON());
    });

    // event handler for when a client disconnects from the server
    socket.on('disconnect', function () {
        var token = socket.handshake.query.token;

        delete players[clientId];

        // let other clients know that the player quit
        socket.broadcast.emit('quit', clientId);

        console.log(' - client \'%s\' disconnected', socket.decoded_token.id);
    });
});

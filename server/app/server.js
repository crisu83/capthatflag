var app = require('./app')
    , socketIo = require('socket.io')
    , jwt = require('socketio-jwt')
    , config = require('./config.json');

// create the server
var server = app.listen(config.port, function() {
    console.log('server started on port %d', config.port);
});

var playerStates = {};

// initialize socket.io
var io = socketIo.listen(server);

io.use(jwt.authorize({
    secret: config.secret
    , handshake: true
}));

io.on('connection', function (socket) {
    console.log('- client \'%s\' connected', socket.decoded_token.id);

    socket.on('join', function (playerState) {
        socket.emit('init', playerStates);

        playerStates[playerState.token] = playerState;

        socket.broadcast.emit('join', playerState);
    });

    socket.on('move', function (playerState) {
        playerStates[playerState.token] = playerState;

        socket.broadcast.emit('move', playerState);
    });

    socket.on('disconnect', function () {
        var token = socket.handshake.query.token;
        delete playerStates[token];
        
        socket.broadcast.emit('quit', token);

        console.log('- client \'%s\' disconnected', socket.decoded_token.id);
    });
});

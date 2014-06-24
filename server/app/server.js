/* jshint camelcase:false */

'use strict';

var app = require('./app')
    , socketIo = require('socket.io')
    , jwt = require('socketio-jwt')
    , config = require('./config.json')
    , game = require('./dungeon/game')
    , server, io;

// create the server
server = app.listen(config.port);

console.log('game server started on port %d', server.address().port);

// initialize socket, a namespace and authorize the connection
io = socketIo.listen(server).of('/dungeon');
io.use(jwt.authorize({secret: config.secret, handshake: true}));

// run the game server
game.run(io);

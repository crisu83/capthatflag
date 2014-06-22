/* jshint camelcase:false */

'use strict';

var app = require('./app')
    , socketIo = require('socket.io')
    , jwt = require('socketio-jwt')
    , config = require('./config.json')
    , game = require('./dungeon/game')
    , utils = require('../../shared/utils')
    , Phaser = require('./phaser')
    , server, io;

// create the server
server = app.listen(config.port, function() {
    console.log('server started on port %d', config.port);
});

// initialize socket, a namespace and authorize the connection
io = socketIo.listen(server).of('/dungeon');
io.use(jwt.authorize({secret: config.secret, handshake: true}));

var ServerState = utils.inherit(Phaser.State, {
    create: function(game) {
        console.log('creating game ...');

        // event handler for when a client connects
        io.on('connection', function(socket) {
            var clientId = socket.decoded_token.id;

            console.log('- client connected \'%s\'', clientId);

            // send the configuration to the client
            socket.emit('client.configure', {
                clientId: clientId
                , canvasWidth: config.canvasWidth
                , canvasHeight: config.canvasHeight
                , gameWidth: config.gameWidth
                , gameHeight: config.gameHeight
            });

            // define the map settings (hard-coded for now)
            var tilesetKey = 'dungeon'
                , tilesetData = JSON.stringify(require('../assets/tilemaps/dungeon.json'))
                , tilesetLayer = 'Floor1'
                , imageKey = 'dungeon'
                , imageFilename = 'dungeon.png';

            // event hanlder for when loading the game
            socket.on('game.load', function() {
                // let the client know which map to load
                socket.emit('room.mapLoad', {
                    tilesetKey: tilesetKey
                    , tilesetUrl: null
                    , tilesetData: tilesetData
                    , tilesetType: null // todo: pass the type from the server
                    , imageKey: imageKey
                    , imageFilename: imageFilename
                });
            });

            // event handler for when creating the game
            socket.on('game.create', function() {
                // let the client know which map to create
                socket.emit('room.mapCreate', {
                    tilesetKey: tilesetKey
                    , tilesetLayer: tilesetLayer
                    , imageKey: imageKey
                });
            });

            socket.on('disconnect', function() {
                console.log('- client disconnected \'%s\'', clientId);
            });
        });
    }
    , update: function(game) {

    }
});

// create a "headless" phaser without rendering
var game = new Phaser.Game(config.canvasWidth, config.canvasHeight, Phaser.HEADLESS);
game.state.add('server', new ServerState());
game.state.start('server');

// run the game
//game.run(socket, config, true);

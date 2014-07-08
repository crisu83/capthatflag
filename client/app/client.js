'use strict';

var $ = require('jquery')
    , io = require('socket.io-client')
    , game = require('./game')
    , primus;

console.log('connecting to server ...');

/* global Primus */
primus = Primus.connect();

primus.on('open', function() {
    console.log('connection established');
});

// event handler for when this client joins a room
primus.on('client.joinRoom', function(roomId) {
    console.log('joined room', roomId);
});

// event handler for initializing the client
primus.on('client.init', function(config) {
    // remove the canvas if it was already created
    // this may happen if the server gets restarted mid-game
    $('canvas').remove();

    // run the game
    game.run(primus, config);
});

// event handler for when an error occurs
primus.on('error', function error(err) {
    console.error('Something horrible has happened', err.stack);
});

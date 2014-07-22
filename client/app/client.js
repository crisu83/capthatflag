'use strict';

var $ = require('jquery')
    , game = require('./game')
    , primus;

// TODO this should not be a console.log messages
console.log('connecting to server ...');

/* global Primus */
primus = Primus.connect();

// TODO this should not be a console.log messages
primus.on('open', function() {
    console.log('connection established');
});

function run(config, debug) {
    // set debug as a global variable
    global.DEBUG = debug;

    // remove the canvas if it was already created
    // this may happen if the server gets restarted mid-game
    $('canvas').remove();

    // run the game
    game.run(primus, config);
}

// event handler for initializing the client
primus.on('client.init', run);

// event handler for resetting the client
primus.on('client.reset', run);

// event handler for when an error has occurred
primus.on('error', function error(err) {
    console.error('Something went wrong', err.stack);
});

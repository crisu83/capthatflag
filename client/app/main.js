require([
    'jquery'
    , 'socket.io'
    , 'dungeon/game'
], function ($, io, game) {
    console.log('connecting to server ...');

    // authenticate with the server
    $.post('/auth').done(function(data) {
        var socket = io.connect('', {query: 'token=' + data.token});

        // event handler for when the player is connected to the server
        socket.on('connect', function () {
            console.log('connection established');
        });

        // request the server for the configuration
        socket.emit('client.requestConfig');

        // event handler for configuring the client
        socket.on('client.configure', function (config) {
            // run the game
            game.run(socket, config);
        });
    });
});

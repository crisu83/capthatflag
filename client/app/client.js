require([
    'jquery'
    , 'socket.io'
    , 'dungeon/game'
], function ($, io, game) {
    console.log('connecting to server ...');

    // authenticate with the server
    $.post('/auth').done(function(data) {
        // connect to the socket namespace using the token we got from the server
        var socket = io.connect(data.namespace, {query: 'token=' + data.token});

        // event handler for when the client is connected to the server
        socket.on('connect', function() {
            console.log('connection established');
        });

        // event handler for configuring the client
        socket.on('client.init', function(config) {
            // remove the canvas if it was already created
            // this may happen if the server gets restarted mid-game
            $('canvas').remove();

            // run the game
            game.run(socket, config);
        });

        // event handler for when the client joins a room
        socket.on('client.joinRoom', function(roomId) {
            console.log('joined room', roomId);
        });
    });
});

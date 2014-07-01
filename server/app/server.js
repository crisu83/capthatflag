'use strict';

var express = require('express')
    , path = require('path')
    , socketio = require('socket.io')
    , socketioJwt = require('socketio-jwt')
    , jwt = require('jsonwebtoken')
    , shortid = require('shortid')
    , game = require('./dungeon/game')
    , config = require('./config.json')
    , webRoot, app, server, io;

// resolve the path to the web root
webRoot = path.resolve(__dirname, '../../client/web');

// create the application
app = express();

// serve static files under /static
app.use('/static', express.static(webRoot));

// handle authentication under /auth
app.post('/auth', function (req, res) {
    // generate the authentication token
    var token = jwt.sign(
        { id: shortid.generate() }
        , config.appSecret
        , { expiresInMinutes: config.tokenExpiresMinutes }
    );

    // send a response containing the token and the socket namespace
    res.json({token: token, namespace: config.socketNamespace});
});

// redirect all other requests to our index.html file
app.get('/', function(req, res) {
    res.sendfile('index.html', {root: webRoot});
});

// create the server
server = app.listen(config.port);
console.log('game server started on port %d', server.address().port);

// initialize socket, a namespace and authorize the connection
io = socketio.listen(server).of(config.socketNamespace);
io.use(socketioJwt.authorize({secret: config.appSecret, handshake: true}));

// run the game server
game.run(io);

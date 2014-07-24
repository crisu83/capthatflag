'use strict';

var express = require('express')
    , path = require('path')
    , Primus = require('primus')
    , shortid = require('shortid')
    , game = require('./game')
    , config = require('./config.json')
    , webRoot, app, server, primus;

// resolve the path to the web root
webRoot = path.resolve(__dirname, '../../client/web');

// create the application
app = express();

// serve static files under /static
app.use('/static', express.static(webRoot));

// redirect all other requests to our index.html file
app.get('/', function(req, res) {
    res.sendfile('index.html', {root: webRoot});
});

// create the server
server = app.listen(config.port);
console.log('game server started on port %d', server.address().port);

// initialize primus
primus = new Primus(server, {
    pathname: config.socketNamespace
    , transformer: 'engine.io'
});

// enable the primus-emit plugin
primus.use('emit', require('primus-emit'));

// run the game server
game.run(primus);

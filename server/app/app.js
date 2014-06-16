'use strict';

var express = require('express')
    , path = require('path')
    , jwt = require('jsonwebtoken')
    , uuid = require('node-uuid')
    , config = require('./config.json');

var webRoot = path.resolve(__dirname, '../../client/web');

// create the application.
var app = express();

// serve static files under /static
app.use('/static', express.static(webRoot));

// handle authentication under /auth
app.post('/auth', function (req, res) {
    var profile = {id: uuid.v4()}
        , token = jwt.sign(profile, config.secret, { expiresInMinutes: 3600 });

    res.json({token: token});
});

// redirect all other requests to our index.html file
app.get('/', function(req, res) {
    res.sendfile('index.html', {root: webRoot});
});

module.exports = app;

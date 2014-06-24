'use strict';

var express = require('express')
    , path = require('path')
    , jwt = require('jsonwebtoken')
    , shortid = require('shortid')
    , config = require('./config.json')
    , webRoot, app;

// resolve the path to the web root
webRoot = path.resolve(__dirname, '../../client/web');

// create the application
app = express();

// serve static files under /static
app.use('/static', express.static(webRoot));

// handle authentication under /auth
app.post('/auth', function (req, res) {
    var profile = {id: shortid.generate()}
        , token = jwt.sign(profile, config.secret, { expiresInMinutes: 5 });

    res.json({token: token});
});

// redirect all other requests to our index.html file
app.get('/', function(req, res) {
    res.sendfile('index.html', {root: webRoot});
});

module.exports = app;

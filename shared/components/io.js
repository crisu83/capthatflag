'use strict';

var utils = require('../utils')
    , ComponentBase = require('../component');

// socket component class
var IoComponent = utils.inherit(ComponentBase, {
    phase: ComponentBase.prototype.phases.IO
    , socket: null
    // constructor
    , constructor: function(socket) {
        this.key = 'io';
        this.socket = socket;
    }
});

module.exports = IoComponent;

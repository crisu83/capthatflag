'use strict';

var utils = require('../utils')
    , ComponentBase = require('../component');

// io component class
var IoComponent = utils.inherit(ComponentBase, {
    key: 'io'
    , phase: ComponentBase.prototype.phases.NETWORK
    , socket: null
    // constructor
    , constructor: function(socket) {
        this.socket = socket;
    }
});

module.exports = IoComponent;

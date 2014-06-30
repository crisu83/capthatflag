'use strict';

var utils = require('./utils');

// hashmap class
var Hashmap = utils.inherit(null, {
    items: null
    // constructor
    , constructor: function(attrs) {
        this.items = {};
    }
    // adds an item to this hashmap
    , add: function(key, value) {
        this.items[key] = value;
    }
    // returns a specific item in this hasmap
    , get: function(key) {
        return key ? this.items[key] : this.items;
    }
    // removes an item from this hashmap and returns it
    , remove: function(key) {
        var item = this.items[key];
        delete this.items[key];
        return item;
    }
});

module.exports = Hashmap;

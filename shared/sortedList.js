'use strict';

var utils = require('./utils');

var SortedList = utils.inherit(null, {
    items: null
    , sort: null
    // constructor
    , constructor: function(sort) {
        this.items = [];
        this.sort = sort;
    }
    // adds an item to this list
    , add: function(item) {
        this.items.push(item);
        this.items.sort(this.sort);
    }
    // gets an item from this list
    , get: function(index) {
        return this.items[index];
    }
    // returns the size of this list
    , size: function() {
        return this.items.length;
    }
});

module.exports = SortedList;

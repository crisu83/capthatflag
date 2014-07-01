'use strict';

var utils = require('./utils')
    , SortedList;

/**
 * Sorted list class.
 * @class shared.SortedList
 */
SortedList = utils.inherit(null, {
    /**
     * Internal items for this list.
     * @type {array}
     */
    items: null
    /**
     * Function for sorting this list.
     * @type {function}
     */
    , sort: null
    /**
     * Creates a new sorted list.
     * @param {function} sort sorting function
     * @constructor
     */
    , constructor: function(sort) {
        this.items = [];
        this.sort = sort;
    }
    /**
     * Adds an item to this list.
     * @param {object} item item to add
     */
    , add: function(item) {
        this.items.push(item);
        this.items.sort(this.sort);
    }
    /**
     * Returns the item with the given index from this list.
     * @param {number} index item index
     * @return {object} item found, or null if not found
     */
    , get: function(index) {
        return this.items[index];
    }
    /**
     * Returns the number of items in this list.
     * @return {number} number of items
     */
    , size: function() {
        return this.items.length;
    }
});

module.exports = SortedList;

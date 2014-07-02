'use strict';

var utils = require('./utils')
    , SortedList;

/**
 * Sorted list class.
 * @class shared.SortedList
 * @classdesc Utility class for sorted lists.
 * @property {array} _items - Internal items for this list.
 * @property {function} _sort - Function for sorting this list.
 */
SortedList = utils.inherit(null, {
    _items: null
    , _sort: null
    /**
     * Creates a new sorted list.
     * @constructor
     * @param {function} sort sorting function
     */
    , constructor: function(sort) {
        this._items = [];
        this._sort = sort;
    }
    /**
     * Adds an item to this list.
     * @method shared.SortedList#add
     * @param {object} item - Item to add.
     */
    , add: function(item) {
        this._items.push(item);
        this._items.sort(this._sort);
    }
    /**
     * Returns the item with the given index from this list.
     * @method shared.SortedList#get
     * @param {number} index - Item index.
     * @return {object} Item found, or null if not found
     */
    , get: function(index) {
        return this._items[index];
    }
    /**
     * Returns the number of items in this list.
     * @method shared.SortedList#size
     * @return {number} Number of items.
     */
    , size: function() {
        return this._items.length;
    }
});

module.exports = SortedList;

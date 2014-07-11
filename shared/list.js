'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , List;

/**
 * List class.
 * @class shared.SortedList
 * @classdesc Utility class for lists.
 */
List = utils.inherit(null, {
    _items: null
    /**
     * Creates a new list.
     * @constructor
     */
    , constructor: function() {
        this._items = [];
    }
    /**
     * Adds an item to this list.
     * @method shared.SortedList#add
     * @param {object} item - Item to add.
     */
    , add: function(item) {
        this._items.push(item);
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
    /**
     * TODO
     */
    , filter: function(filter) {
        this._items = _.filter(this._items, filter);
    }
});

module.exports = List;

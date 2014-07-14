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
     * @param {number} index - Item index, omit to get all items.
     * @return {object} Item found, or null if not found
     */
    , get: function(index) {
        if (typeof index === 'undefined') {
            return this._items;
        } else {
            return this._items[index];
        }
    }
    /**
     * TODO
     */
    , set: function(index, item) {
        this._items[index] = item;
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
    , clear: function() {
        this._items = [];
    }
    /**
     * TODO
     */
    , isEmpty: function() {
        return this._items.length === 0;
    }
    /**
     * TODO
     */
    , filter: function(filter) {
        this._items = _.filter(this._items, filter);
    }
    /**
     * TODO
     */
    , first: function() {
        return this._items[0];
    }
    /**
     * TODO
     */
    , last: function() {
        return this._items[this._items.length - 1];
    }
});

module.exports = List;

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
     * @method shared.List#add
     * @param {object} item - Item to add.
     */
    , add: function(item) {
        this._items.push(item);
    }
    /**
     * Returns the item with the given index from this list.
     * @method shared.List#get
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
     * Sets an item to the list.
     * @method shared.List#set
     * @param {number} index - Item index.
     * @param {objec} item - Item to set.
     */
    , set: function(index, item) {
        this._items[index] = item;
    }
    /**
     * Returns the number of items in this list.
     * @method shared.List#size
     * @return {number} Number of items.
     */
    , size: function() {
        return this._items.length;
    }
    /**
     * Removes all items from the list.
     * @method shared.List#clear
     */
    , clear: function() {
        this._items = [];
    }
    /**
     * Returns whether the list contains no items.
     * @method shared.List#isEmpty
     * @return {boolean} The result.
     */
    , isEmpty: function() {
        return this._items.length === 0;
    }
    /**
     * Filters the items using the given callback function.
     * @method shared.List#filter
     * @param {function} filter - Filtering function.
     */
    , filter: function(filter) {
        this._items = _.filter(this._items, filter);
    }
    /**
     * Returns the first item in the list.
     * @method shared.List#first
     * @return {object} Item found, or null if not found.
     */
    , first: function() {
        return this._items[0];
    }
    /**
     * Returns the last item in the list.
     * @method shared.List#last
     * @return {object} Item found, or null if not found.
     */
    , last: function() {
        return this._items[this._items.length - 1];
    }
});

module.exports = List;

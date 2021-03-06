'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , List;

/**
 * List class.
 * @class shared.utils.SortedList
 * @classdesc Utility class for lists.
 */
List = utils.inherit(null, {
    /**
     * Creates a new list.
     * @constructor
     * @param {array|null} items - Initial list items.
     */
    constructor: function(items) {
        // internal properties
        this._items = items || [];
    }
    /**
     * Adds an item to this list.
     * @method shared.utils.List#add
     * @param {object} item - Item to add.
     */
    , add: function(item) {
        this._items.push(item);
    }
    /**
     * TODO
     */
    , exists: function(item) {
        return this._items.indexOf(item) !== -1;
    }
    /**
     * Removes an item from the list.
     * @method shared.utils.List#remove
     * @param {object} item - Item to remove.
     * @return {boolean} Whether the item was removed.
     */
    , remove: function(item) {
        return this._items.splice(this._items.indexOf(item), 1) !== null;
    }
    /**
     * Returns the item with the given index from this list.
     * @method shared.utils.List#get
     * @param {number} index - Item index, omit to get all items.
     * @return {object} Item found, or null if not found
     */
    , get: function(index) {
        if (typeof index === 'undefined') {
            return _.clone(this._items);
        } else {
            return this._items[index];
        }
    }
    /**
     * Sets an item to the list.
     * @method shared.utils.List#set
     * @param {number} index - Item index.
     * @param {objec} item - Item to set.
     */
    , set: function(index, item) {
        this._items[index] = item;
    }
    /**
     * Returns the number of items in this list.
     * @method shared.utils.List#size
     * @return {number} Number of items.
     */
    , size: function() {
        return this._items.length;
    }
    /**
     * Removes all items from the list.
     * @method shared.utils.List#clear
     */
    , clear: function() {
        this._items.length = 0;
    }
    /**
     * Returns whether the list contains no items.
     * @method shared.utils.List#isEmpty
     * @return {boolean} The result.
     */
    , isEmpty: function() {
        return this._items.length === 0;
    }
    /**
     * Iterates items in the list.
     * @method shared.utils.List#each
     * @param {function} callback - Callback function.
     * @param {object} scope - Callback scope.
     */
    , each: function(callback, scope) {
        _.forOwn(this._items, callback, scope);
    }
    /**
     * Filters the items using the given callback function.
     * @method shared.utils.List#filter
     * @param {function} filter - Filtering function.
     * @param {boolean} replace - Wheter the original items should be replaced.
     */
    , filter: function(filter, replace) {
        // TODO change the default to false when all uses has been overhauled
        replace = replace || true;
        var items = _.filter(this._items, filter);
        if (replace) {
            this._items = items;
        }
        return items;
    }
    /**
     * Shuffles the items in the list.
     * @method shared.utils.List#shuffle
     */
    , shuffle: function() {
        _.shuffle(this._items);
    }
    /**
     * Returns the first item in the list.
     * @method shared.utils.List#first
     * @return {object} Item found, or null if not found.
     */
    , first: function() {
        return this._items[0];
    }
    /**
     * Returns the last item in the list.
     * @method shared.utils.List#last
     * @return {object} Item found, or null if not found.
     */
    , last: function() {
        return this._items[this.size() - 1];
    }
});

module.exports = List;

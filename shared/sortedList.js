'use strict';

var utils = require('./utils')
    , ListBase = require('./list')
    , SortedList;

/**
 * Sorted list class.
 * @class shared.SortedList
 * @classdesc Utility class for sorted lists.
 * @extends shared.List
 */
SortedList = utils.inherit(ListBase, {
    _sort: null
    /**
     * Creates a new sorted list.
     * @constructor
     * @param {function} sort sorting function
     */
    , constructor: function(sort) {
        ListBase.apply(this);
        this._sort = sort;
    }
    /**
     * Adds an item to this list.
     * @method shared.SortedList#add
     * @param {object} item - Item to add.
     */
    , add: function(item) {
        ListBase.prototype.add.apply(this, arguments);
        this._items.sort(this._sort);
    }
});

module.exports = SortedList;

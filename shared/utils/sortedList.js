'use strict';

var utils = require('../utils')
    , ListBase = require('./list')
    , SortedList;

/**
 * Sorted list class.
 * @class shared.utils.SortedList
 * @classdesc Utility class for sorted lists.
 * @extends shared.utils.List
 */
SortedList = utils.inherit(ListBase, {
    _sort: null
    /**
     * Creates a new sorted list.
     * @constructor
     * @param {function} sort sorting function
     * TODO
     */
    , constructor: function(sort, items) {
        ListBase.apply(this, [items]);
        this._sort = sort;
    }
    /**
     * Adds an item to this list.
     * @method shared.utils.SortedList#add
     * @param {object} item - Item to add.
     */
    , add: function(item) {
        ListBase.prototype.add.apply(this, arguments);
        this._items.sort(this._sort);
    }
});

module.exports = SortedList;

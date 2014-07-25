'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , ListBase = require('./list')
    , SortedList;

/**
 * Sorted list class.
 * @class shared.utils.SortedList
 * @classdesc Utility class for sorted lists.
 * @extends shared.utils.List
 */
SortedList = utils.inherit(ListBase, {
    /**
     * Creates a new list.
     * @constructor
     * @param {function} sort - Sorting function.
     * @param {array} items - Initial items.
     */
    constructor: function(sort, items) {
        ListBase.call(this, items);

        // internal properties
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

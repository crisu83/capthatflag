'use strict';

var utils = require('./utils')
    , Hashmap;

/**
 * Hashmap class.
 * @class shared.Hashmap
 * @classdesc Utility class for hashmaps.
 * @property {object} _items - Internal items in this hashmap.
 */
Hashmap = utils.inherit(null, {
    _items: null
    /**
     * Creates a new hashmap.
     * @constructor
     * @param {object} items initial items.
     */
    , constructor: function(items) {
        this._items = items || {};
    }
    /**
     * Adds an item to this hashmap.
     * @method shared.Hashmap#add
     * @param {string|object} key - Item key.
     * @param {object} value - Item value.
     */
    , add: function(key, value) {
        this._items[key] = value;
    }
    /**
     * Returns a specific item in this hasmap.
     * @method shared.Hashmap#get
     * @param {string} key - Item key.
     * @return {object} Item, or null if not found.
     */
    , get: function(key) {
        return key ? this._items[key] : this._items;
    }
    /**
     * Removes an item from this hashmap and returns it.
     * @method shared.Hashmap#remove
     * @param {string} key - Item key
     * @return {object} Removed item.
     */
    , remove: function(key) {
        var item = this._items[key];
        delete this._items[key];
        return item;
    }
});

module.exports = Hashmap;

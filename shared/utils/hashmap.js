'use strict';

var _ = require('lodash')
    , utils = require('../utils')
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
        this.set(key, value);
    }
    /**
     * Returns a specific item in this hasmap.
     * @method shared.Hashmap#get
     * @param {string} key - Item key.
     * @return {object} Item, or null if not found.
     */
    , get: function(key) {
        if (typeof key === 'string' || typeof key === 'number') {
            return this._items[key];
        } else if (key instanceof Array) {
            return _.pick(this._items, key);
        } else {
            return _.clone(this._items);
        }
    }
    /**
     * TODO
     */
    , set: function(key, value) {
        // TODO handle the case if key is not an object
        if (typeof value === 'undefined') {
            _.extend(this._items, key);
        } else {
            this._items[key] = value;
        }
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
    /**
     * TODO
     */
    , each: function(callback, scope) {
        _.forOwn(this._items, callback, scope);
    }
});

module.exports = Hashmap;

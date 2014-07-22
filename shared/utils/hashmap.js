'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , Hashmap;

/**
 * Hashmap class.
 * @class shared.utils.Hashmap
 * @classdesc Utility class for hashmaps.
 */
Hashmap = utils.inherit(null, {
    /**
     * Creates a new hashmap.
     * @constructor
     * @param {object} items initial items.
     */
    constructor: function(items) {
        // internal properties
        this._items = items || {};
    }
    /**
     * Adds an item to the hashmap.
     * @method shared.utils.Hashmap#add
     * @param {string|object} key - Item key.
     * @param {object} value - Item value.
     */
    , add: function(key, value) {
        this.set(key, value);
    }
    /**
     * Returns all the keys in the hashmap.
     * @method shared.utils.Hashmap#keys
     * @return {array} List of keys.
     */
    , keys: function() {
        return _.keys(this._items);
    }
    /**
     * Returns items from the hashmap
     * @method shared.utils.Hashmap#get
     * @param {string|array|null} key - Item key, an array of keys or null.
     * @return {object} Item, items or null if not found.
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
     * Sets a single or multiple values in the hashmap.
     * @method shared.utils.Hashmap#set
     * @param {string|object} key - Item key or an object with keys and values.
     * @param {string} value - Item value.
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
     * Removes an item from the hashmap and returns it.
     * @method shared.utils.Hashmap#remove
     * @param {string} key - Item key
     * @return {object} Removed item.
     */
    , remove: function(key) {
        var item = this._items[key];
        delete this._items[key];
        return item;
    }
    /**
     * Removes all the items from the hashmap.
     * @method shared.utils.Hashmap#clear
     */
    , clear: function() {
        this._items = {};
    }
    /**
     * Iterates items in the hashmap.
     * @method shared.utils.Hashmap#each
     * @param {function} callback - Callback function.
     * @param {object} scope - Callback scope.
     */
    , each: function(callback, scope) {
        _.forOwn(this._items, callback, scope);
    }
});

module.exports = Hashmap;

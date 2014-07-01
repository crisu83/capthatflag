'use strict';

var utils = require('./utils')
    , Hashmap;

/**
 * Hashmap class
 * @class shared.Hashmap
 */
Hashmap = utils.inherit(null, {
    /**
     * Internal items in this hashmap.
     * @type {object}
     */
    items: null
    /**
     * Creates a new hashmap.
     * @param {object} items initial items
     * @constructor
     */
    , constructor: function(items) {
        this.items = items || {};
    }
    /**
     * Adds an item to this hashmap.
     * @param {string} key item key
     * @param {object} value item value
     */
    , add: function(key, value) {
        this.items[key] = value;
    }
    /**
     * Returns a specific item in this hasmap.
     * @param {string} key item key
     * @return {object} item, or null if not found
     */
    , get: function(key) {
        return key ? this.items[key] : this.items;
    }
    /**
     * Removes an item from this hashmap and returns it.
     * @param {string} key item key
     * @return {object} removed item
     */
    , remove: function(key) {
        var item = this.items[key];
        delete this.items[key];
        return item;
    }
});

module.exports = Hashmap;

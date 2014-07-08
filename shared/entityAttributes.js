'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , EntityAttributes;

/**
 * Entity attributes class.
 * @class shared.EntityAttributes
 * @classdesc Utility class for managing entity attributes.
 * @property {object} _attributes - Internal attributes object literal.
 */
EntityAttributes = utils.inherit(null, {
    _attributes: null
    , _changed: null
    /**
     * Creates a new set of entity attributes.
     * @constructor
     * @param {object} attrs - Initial attributes.
     */
    , constructor: function(attrs) {
        this._attributes = attrs || {};
        this._changed = [];
    }
    /**
     * Returns the names of the attributes that has changed.
     * @method shared.EntityAttributes#changed
     * @return {array} Changed attributes.
     */
    , changed: function() {
        var attrs = _.pick(this._attributes, this._changed);
        this._changed = [];
        return attrs;
    }
    /**
     * Returns all, multiple or a single value from these attributes.
     * @method shared.EntityAttributes#get
     * @param {string|array} name - Attribute(s) to get, omit to get all.
     * @return {string|array} Attribute value(s).
     */
    , get: function(name) {
        if (!name) {
            return _.clone(this._attributes);
        } else if (typeof name !== 'string') {
            return _.pick(this._attributes, name);
        } else {
            return this._attributes[name];
        }
    }
    /**
     * Sets multiple or a single value for these attributes.
     * @method shared.EntityAttributes#set
     * @param {array|string} name - Attribute(s) to set.
     * @param {string} value - Attribute value, omit if when multiple values
     */
    , set: function(name, value) {
        if (typeof name !== 'string') {
            this._changed = _.extend(this._changed, this.compare(name));
            _.extend(this._attributes, name);
        } else {
            this._attributes[name] = value;
            this._changed.push(name);
        }
    }
    /**
     * Compares the given attributes to the current attributes
     * and returns the names for the attributes that has changed.
     * @method shared.EntityAttributes#compared
     * @param {object} attrs - Attributes to compare.
     * @return {array} Changed attributes.
     */
    , compare: function(attrs) {
        var changed = [];
        for (var name in attrs) {
            if (attrs.hasOwnProperty(name) && this._attributes[name] !== attrs[name]) {
                changed.push(name);
            }
        }
        return changed;
    }
    /**
     * Returns whether the attributes has been changed.
     * @method shared.EntityAttributes#hasChanged
     * @return {boolean} The result.
     */
    , hasChanged: function() {
        return this._changed.length > 0;
    }
});

module.exports = EntityAttributes;

'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , EntityAttributes;

/**
 * Entity attributes class.
 * @class shared.EntityAttributes
 */
EntityAttributes = utils.inherit(null, {
    /**
     * Internal attributes.
     * @type {object}
     */
    attributes: null
    /**
     * Creates a new set of entity attributes.
     * @param {object} attrs initial attributes
     * @constructor
     */
    , constructor: function(attrs) {
        this.attributes = attrs || {};
    }
    /**
     * Returns all, multiple or a single value from these attributes.
     * @param {string|array} name attribute(s) to get, omit to get all
     * @return {string|array} attribute value(s)
     */
    , get: function(name) {
        if (!name) {
            return _.clone(this.attributes);
        } else if (typeof name !== 'string') {
            return _.pick(this.attributes, name);
        } else {
            return this.attributes[name];
        }
    }
    /**
     * Sets multiple or a single value for these attributes.
     * @param {array|string} name attribute(s) to set
     * @param {string} value attribute value, omit if setting multiple values
     */
    , set: function(name, value) {
        if (typeof name !== 'string') {
            _.extend(this.attributes, name);
        } else {
            this.attributes[name] = value;
        }
    }
});

module.exports = EntityAttributes;

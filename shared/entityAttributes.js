'use strict';

var _ = require('lodash')
    , utils = require('./utils');

// entity attributes class
var EntityAttributes = utils.inherit(null, {
    attributes: null
    // constructor
    , constructor: function(attrs) {
        this.attributes = attrs || {};
    }
    // returns all, multiple or a single value from these attributes
    , get: function(name) {
        if (!name) {
            return _.clone(this.attributes);
        } else if (typeof name !== 'string') {
            return _.pick(this.attributes, name);
        } else {
            return this.attributes[name];
        }
    }
    // sets multiple or a single value for these attributes
    , set: function(name, value) {
        if (typeof name !== 'string') {
            _.extend(this.attributes, name);
        } else {
            this.attributes[name] = value;
        }
    }
});

module.exports = EntityAttributes;

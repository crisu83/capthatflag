'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , SortedList = require('./sortedList')
    , ComponentList;

/**
 * Entity components class.
 * @class shared.ComponentList
 * @classdesc Utility class for managing entity components.
 * @property {shared.Entity} _owner - Associated entity instance.
 * @property {shared.SortedList} _components - Internal list of components.
 */
ComponentList = utils.inherit(null, {
    _owner: null
    , _components: null
    /**
     * Creates a new set of entity components.
     * @constructor
     * @param {shared.Entity} owner - Entity instance.
     */
    , constructor: function(owner) {
        this._owner = owner;
        this._components = new SortedList(function(a, b) {
            return a.phase < b.phase;
        });
    }
    /**
     * Adds a component item to this set of components.
     * @method shared.EntityComponents#add
     * @param {shared.Component} component - Component to add.
     */
    , add: function(component) {
        component.owner = this._owner;
        component.init();
        this._components.add(component);
    }
    /**
     * Returns a specific component from this set of components.
     * @method shared.EntityComponents#get
     * @param {string} key - Component key.
     * @return {shared.Component|null} Component instance, or null if not found.
     */
    , get: function(key) {
        this._components.each(function(component) {
            if (component.key === key) {
                return component;
            }
        });
        return null;
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this._components.each(function(component) {
            component.update(elapsed);
        });
    }
});

module.exports = ComponentList;

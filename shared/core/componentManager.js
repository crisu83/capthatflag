'use strict';

var _ = require('lodash')
    , utils = require('../utils')
    , SortedList = require('../utils/sortedList')
    , ComponentManager;

/**
 * Entity components class.
 * @class shared.utils.ComponentManager
 * @classdesc Utility class for managing entity components.
 */
ComponentManager = utils.inherit(null, {
    /**
     * Creates a new component manager.
     * @constructor
     * @param {shared.core.Entity} owner - Entity instance.
     */
    constructor: function(owner) {
        // internal properties
        this._owner = owner;
        this._components = new SortedList(function(a, b) {
            return a.phase < b.phase;
        });
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this._components.each(function(component) {
            component.update(elapsed);
        });
    }
    /**
     * Adds a component item to this set of components.
     * @method shared.utils.ComponentManager#add
     * @param {shared.core.Component} component - Component to add.
     */
    , add: function(component) {
        component.owner = this._owner;
        component.init();
        this._components.add(component);
    }
    /**
     * Returns a specific component from this set of components.
     * @method shared.utils.ComponentManager#get
     * @param {string} key - Component key.
     * @return {shared.core.Component|null} Component instance, or null if not found.
     */
    , get: function(key) {
        var result = null;
        this._components.each(function(component) {
            if (component.key === key) {
                result = component;
            }
        });
        return result;
    }
});

module.exports = ComponentManager;

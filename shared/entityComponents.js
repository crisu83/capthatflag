'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , SortedList = require('./sortedList')
    , EntityComponents;

/**
 * Entity components class.
 * @class shared.EntityComponents
 * @classdesc Utility class for managing entity components.
 * @property {shared.Entity} _enitty - Associated entity instance.
 * @property {shared.SortedList} _components - Internal list of components.
 */
EntityComponents = utils.inherit(null, {
    _entity: null
    , _components: null
    /**
     * Creates a new set of entity components.
     * @constructor
     * @param {shared.Entity} entity - Entity instance.
     */
    , constructor: function(entity) {
        this._entity = entity;
        this._components = new SortedList(function(a, b) {
            return a.phase < b.phase;
        });
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        for (var i = 0; i < this.components.items.length; i++) {
            this.components.get(i).update(elapsed);
        }
    }
    /**
     * Returns a specific component from this set of components.
     * @method shared.EntityComponents#get
     * @param {string} key - Component key.
     * @return {shared.Component|null} Component instance, or null if not found.
     */
    , get: function(key) {
        for (var i = 0, component; i < this._components.size(); i++) {
            if (this._components.get(i).key === key) {
                return component;
            }
        }
        return null;
    }
    /**
     * Adds a component item to this set of components.
     * @method shared.EntityComponents#add
     * @param {shared.Component} component - Component to add.
     */
    , add: function(component) {
        component.owner = this._entity;
        component.init();
        this._components.add(component);
    }
});

module.exports = EntityComponents;

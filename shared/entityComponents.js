'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , SortedList = require('./sortedList')
    , EntityComponents;

/**
 * Entity components class.
 * @class shared.EntityComponents
 */
EntityComponents = utils.inherit(null, {
    /**
     * Entity associated with this set of components.
     * @type {shared.Entity}
     */
    entity: null
    /**
     * Internal set of components.
     * @type {shared.SortedList}
     */
    , components: null
    /**
     * Creates a new set of entity components.
     * @param {shared.Entity} entity associated entity instance
     * @constructor
     */
    , constructor: function(entity) {
        this.entity = entity;
        this.components = new SortedList(function(a, b) {
            return a.phase < b.phase;
        });
    }
    /**
     * @inheritdoc
     */
    , update: function(elapsed) {
        for (var i = 0; i < this.components.items.length; i++) {
            this.components.get(i).update(elapsed);
        }
    }
    /**
     * Returns a specific component from this set of components.
     * @param {string} key component key
     * @return {shared.Component|null} component instance, or null if not found
     */
    , get: function(key) {
        for (var i = 0, component; i < this.components.size(); i++) {
            component = this.components.get(i);
            if (component.key === key) {
                return component;
            }
        }
        return null;
    }
    /**
     * Adds a component item to this set of components.
     * @param {shared.Component} component component to add
     */
    , add: function(component) {
        component.owner = this.entity;
        component.init();
        this.components.add(component);
    }
});

module.exports = EntityComponents;

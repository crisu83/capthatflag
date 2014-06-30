'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , SortedList = require('./sortedList');

// entity components class
var EntityComponents = utils.inherit(null, {
    entity: null
    , components: null
    // constructor
    , constructor: function(entity) {
        this.entity = entity;
        this.components = new SortedList(function(a, b) {
            return a.phase < b.phase;
        });
    }
    // updates the component logic for the associated entity
    , update: function(elapsed) {
        for (var i = 0; i < this.components.items.length; i++) {
            this.components.get(i).update(elapsed);
        }
    }
    // returns a specific component for the associated entity
    , get: function(key) {
        for (var i = 0, component; i < this.components.size(); i++) {
            component = this.components.get(i);
            if (component.key === key) {
                return component;
            }
        }
        return null;
    }
    // adds a component to the associated entity
    , add: function(component) {
        component.owner = this.entity;
        component.init();
        this.components.add(component);
    }
});

module.exports = EntityComponents;

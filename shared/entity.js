'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , Node = require('./node')
    , SortedList = require('./sortedList');

// base entity class
var Entity = utils.inherit(Node, {
    key: 'entity'
    // todo: consider using Object.defineProperty for these
    , socket: null
    , states: null
    , attributes: null
    , components: null
    // constructor
    , constructor: function(socket, attrs) {
        Node.apply(this);

        this.socket = socket;
        this.states = [];
        this.attributes = attrs || {};
        this.components = new SortedList(function(a, b) {
            return a.phase < b.phase;
        });
    }
    // updates the logic for this entity
    , update: function(elapsed) {
        // update the components (already sorted)
        for (var i = 0; i < this.components.items.length; i++) {
            this.components.get(i).update(elapsed);
        }
    }
    // updates the state of the this entity
    , sync: function(state) {
        // update attributes and trigger the sync event
        this.setAttrs(state);
        this.trigger('entity.sync', this.serialize());
    }
    // adds a new state to this entity
    , pushState: function(state) {
        this.states.push(state);
    }
    // deletes a specific state for this entity
    , deleteState: function(timestamp) {
        for (var i = 0; i < this.states.length; i++) {
            if (this.states[i].timestamp === timestamp) {
                this.states.splice(i, 1);
            }
        }
    }
    // returns a specific attribute for this entity
    , getAttr: function(name) {
        return this.attributes[name];
    }
    // sets a specific attribute for this entity
    , setAttr: function(name, value) {
        this.attributes[name] = value;
    }
    // sets multiple attributes at once for this entity
    , setAttrs: function(attrs) {
        for (var name in attrs) {
            if (attrs.hasOwnProperty(name)) {
                this.attributes[name] = attrs[name];
            }
        }
    }
    // adds a component to this entity
    , addComponent: function(component) {
        component.owner = this;
        component.init();
        this.components.add(component);
    }
    // returns a specific component for this entity
    , getComponent: function(key) {
        var i, component;
        for (i = 0; i < this.components.size(); i++) {
            component = this.components.get(i);
            if (component.key === key) {
                return component;
            }
        }
        return null;
    }
    // kills this entity
    , die: function() {
        this.trigger('entity.die', [this]);
    }
    // serializes this entity to a json object
    , serialize: function() {
        return this.attributes;
    }
});

module.exports = Entity;

'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , Node = require('./node')
    , EntityState = require('./entityState')
    , EntityAttributes = require('./entityAttributes')
    , EntityComponents = require('./entityComponents');

// base entity class
var Entity = utils.inherit(Node, {
    key: 'entity'
    , socket: null
    , state: null
    , attrs: null
    , components: null
    // constructor
    , constructor: function(socket, attrs) {
        Node.apply(this);

        this.socket = socket;
        this.state = new EntityState();
        this.attrs = new EntityAttributes(attrs);
        this.components = new EntityComponents(this);
    }
    // updates the logic for this entity
    , update: function(elapsed) {
        this.components.update(elapsed);
    }
    // applies a state to this entity
    , applyState: function(state) {
        var attrs = this.simulateState(state);
        this.attrs.set(attrs);
    }
    // simulates the outcome for a state and returns the result
    , simulateState: function(state, attrs) {
        attrs = attrs || this.attrs.get();

        if (state.input && state.elapsed && state.speed) {
            var step = (state.elapsed / 1000) * state.speed;

            // do the move on the server to to ensure that it is done correctly
            for (var i = 0; i < state.input.length; i++) {
                if (state.input[i] === 'up') {
                    attrs.y -= step;
                } else if (state.input[i] === 'down') {
                    attrs.y += step;
                }
                if (state.input[i] === 'left') {
                    attrs.x -= step;
                } else if (state.input[i] === 'right') {
                    attrs.x += step;
                }
            }
        }

        return attrs;
    }
    // kills this entity
    , die: function() {
        this.trigger('entity.die', [this]);
    }
    // serializes this entity to a json object
    , serialize: function() {
        return this.attrs.get();
    }
});

module.exports = Entity;

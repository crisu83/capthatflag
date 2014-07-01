'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , Node = require('./node')
    , EntityState = require('./entityState')
    , EntityAttributes = require('./entityAttributes')
    , EntityComponents = require('./entityComponents')
    , Entity;

/**
 * Entity base class.
 * @class shared.Entity
 * @classdesc Base class for both the client- and server-side entity classes.
 * @extends shared.Node
 * @property {socketio.Socket} socket - Socket interface for this entity.
 * @property {shared.EntityState} state - Entity state instance.
 * @property {shared.EntityAttributes} attrs - Entity attributes instance.
 * @property {shared.EntityComponents} components - Entity components instance.
 */
Entity = utils.inherit(Node, {
    key: 'entity'
    , socket: null
    , state: null
    , attrs: null
    , components: null
    /**
     * Creates a new entity.
     * @constructor
     * @param {socketio.Socket} socket - Socket interface.
     * @param {object} attrs - Initial attributes.
     */
    , constructor: function(socket, attrs) {
        Node.apply(this);

        this.socket = socket;
        this.state = new EntityState();
        this.attrs = new EntityAttributes(attrs);
        this.components = new EntityComponents(this);
    }
    /**
     * Updates the logic for this entity.
     * @method shared.Entity#update
     * @param {number} elapsed - Time elapsed since the previous update (ms).
     */
    , update: function(elapsed) {
        this.components.update(elapsed);
    }
    /**
     * Applies a state to this entity.
     * @method shared.Entity#applyState
     * @param {object} state - Entity state to apply.
     */
    , applyState: function(state) {
        var attrs = this.simulateState(state);
        this.attrs.set(attrs);
    }
    /**
     * Simulates the outcome for a state and returns the result.
     * @method shared.Entity#simulateState
     * @param {object} state - Entity state to simulate.
     * @param {object} attrs - Initial attribute values, or null to use current values.
     */
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
    /**
     * Kills this entity.
     * @method shared.Entity#die
     */
    , die: function() {
        this.trigger('entity.die', [this]);
    }
    /**
     * Serializes this entity to a JSON object.
     * @method shared.Entity#serialize
     */
    , serialize: function() {
        return this.attrs.get();
    }
});

module.exports = Entity;

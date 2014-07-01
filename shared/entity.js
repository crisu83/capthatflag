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
 * @extends shared.Node
 */
Entity = utils.inherit(Node, {
    /**
     * @inheritdoc
     */
    key: 'entity'
    /**
     * Socket interface for this entity.
     * @type {Socket}
     */
    , socket: null
    /**
     * Entity state instance.
     * @type {shared.EntityState}
     */
    , state: null
    /**
     * Entity attributes instance.
     * @type {shared.EntityAttributes}
     */
    , attrs: null
    /**
     * Entity components instance.
     * @type {shared.EntityComponents}
     */
    , components: null
    /**
     * Creates a new entity.
     * @param {Socket} socket socket interface
     * @param {object} attrs initial attributes
     * @constructor
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
     * @param {number} elapsed time elapsed since the previous update (ms)
     */
    , update: function(elapsed) {
        this.components.update(elapsed);
    }
    /**
     * Applies a state to this entity.
     * @param {object} state entity state to apply
     */
    , applyState: function(state) {
        var attrs = this.simulateState(state);
        this.attrs.set(attrs);
    }
    /**
     * Simulates the outcome for a state and returns the result.
     * @param {object} state entity state to simulate
     * @param {object} attrs source attributes
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
     */
    , die: function() {
        this.trigger('entity.die', [this]);
    }
    /**
     * Serializes this entity to a JSON object.
     */
    , serialize: function() {
        return this.attrs.get();
    }
});

module.exports = Entity;

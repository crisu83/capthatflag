'use strict';

var _ = require('lodash')
    , utils = require('./utils')
    , Node = require('./node')
    , EntityAttributes = require('./entityAttributes')
    , EntityComponents = require('./entityComponents')
    , EntityState = require('./entityState')
    , Entity;

/**
 * Entity base class.
 * @class shared.Entity
 * @classdesc Base class for both the client- and server-side entity classes.
 * @extends shared.Node
 * @property {primus.Client|primus.Spark} socket - Socket interface for this entity.
 * @property {shared.EntityState} state - Entity state instance.
 * @property {shared.EntityAttributes} attrs - Entity attributes instance.
 * @property {shared.EntityComponents} components - Entity components instance.
 */
Entity = utils.inherit(Node, {
    key: 'entity'
    , socket: null
    , attrs: null
    , components: null
    , state: null
    /**
     * Creates a new entity.
     * @constructor
     * @param {socketio.Socket} socket - Socket interface.
     * @param {object} attrs - Initial attributes.
     */
    , constructor: function(socket, attrs) {
        Node.apply(this);

        this.socket = socket;
        this.attrs = new EntityAttributes(attrs);
        this.components = new EntityComponents(this);
        this.state = new EntityState();
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
     * Kills this entity.
     * @method shared.Entity#die
     */
    , die: function() {
        this.trigger('entity.die', [this.attrs.get('id')]);
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

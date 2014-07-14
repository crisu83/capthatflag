'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('./utils')
    , Node = require('./node')
    , EntityAttributes = require('./entityAttributes')
    , EntityComponents = require('./entityComponents')
    , Entity;

/**
 * Entity base class.
 * @class shared.Entity
 * @classdesc Base class for both the client- and server-side entity classes.
 * @extends shared.Node
 * @property {string} id - Unique entity identifier.
 * @property {object} config - Game configuration.
 * @property {primus.Client|primus.Spark} socket - Socket interface for this entity.
 * @property {shared.EntityAttributes} attrs - Entity attributes instance.
 * @property {shared.EntityComponents} components - Entity components instance.
 */
Entity = utils.inherit(Node, {
    key: 'entity'
    , id: null
    , socket: null
    , config: null
    , attrs: null
    , components: null
    /**
     * Creates a new entity.
     * @constructor
     * @param {socketio.Socket} socket - Socket interface.
     * @param {object} data - Entity data.
     * @param {object} config - Game configuration.
     */
    , constructor: function(socket, data, config) {
        Node.apply(this);

        this.id = data.id;
        this.key = data.key;
        this.socket = socket;
        this.config = config;
        this.attrs = new EntityAttributes(data.attrs);
        this.components = new EntityComponents(this);
    }
    /**
     * TODO
     */
    , sync: function(attrs) {
        this.trigger('entity.sync', [attrs]);
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
        this.trigger('entity.die', [this.id]);
    }
    /**
     * Serializes this entity to a JSON object.
     * @method shared.Entity#serialize
     */
    , serialize: function() {
        return {id: this.id, key: this.key, attrs: this.attrs.get()};
    }
});

module.exports = Entity;

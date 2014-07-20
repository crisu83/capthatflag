'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../utils')
    , Node = require('./node')
    , Hashmap = require('../utils/hashmap')
    , SortedList = require('../utils/sortedList')
    , ComponentList = require('../utils/componentList')
    , Entity;

/**
 * Entity class.
 * @class shared.Entity
 * @classdesc Final class for entities with support for components and attributes.
 * @extends shared.Node
 * @property {string} id - Unique entity identifier.
 * @property {primus.Client|primus.Spark} socket - Socket interface.
 * @property {object} config - Game configuration.
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
        this.attrs = new Hashmap(data.attrs);
        this.components = new ComponentList(this);
    }
    /**
     * Synchronizes the entity attributes.
     * @method shared.Entity#sync
     * @param {object} attrs - Attributes to synchronize.
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

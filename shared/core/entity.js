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
 * @class shared.core.Entity
 * @classdesc Final class for entities.
 * @extends shared.core.Node
 */
Entity = utils.inherit(Node, {
    /**
     * Creates a new entity.
     * @constructor
     * @param {socketio.Socket} socket - Socket interface.
     * @param {object} data - Entity data.
     */
    constructor: function(socket, data, config) {
        Node.apply(this);

        // inherited properties
        this.key = data.key || 'entity';

        /**
         * @property {string} id - Unique entity identifier.
         */
        this.id = data.id;
        /**
         * @property {Primus.Client|Primus.Spark} socket - Socket interface.
         */
        this.socket = socket;
        /**
         * @property {shared.utils.Hashmap} attrs - Hashmap over the entities attributes.
         */
        this.attrs = new Hashmap(data.attrs);
        /**
         * @property {shared.utils.ComponentList} components - List of components.
         */
        this.components = new ComponentList(this);
        /**
         * @property {object} config - Game configuration.
         */
        this.config = config;
    }
    /**
     * Synchronizes the entity attributes.
     * @method shared.core.Entity#sync
     * @param {object} attrs - Attributes to synchronize.
     */
    , sync: function(attrs) {
        this.trigger('entity.sync', [attrs]);
    }
    /**
     * Updates the entity logic.
     * @method shared.core.Entity#update
     * @param {number} elapsed - Time elapsed since the previous update (ms).
     */
    , update: function(elapsed) {
        this.components.update(elapsed);
    }
    /**
     * Kills this entity.
     * @method shared.core.Entity#die
     */
    , die: function() {
        this.trigger('entity.die', [this.id]);
    }
    /**
     * Serializes this entity to a JSON object.
     * @method shared.core.Entity#serialize
     */
    , serialize: function() {
        return {id: this.id, key: this.key, attrs: this.attrs.get()};
    }
});

module.exports = Entity;

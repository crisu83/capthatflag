'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , utils = require('../utils')
    , Node = require('./node')
    , Hashmap = require('../utils/hashmap')
    , ComponentManager = require('../core/componentManager')
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
     * @param {object} data - Entity data.
     */
    constructor: function(data, config) {
        Node.apply(this);

        // inherited properties
        this.key = data.key || 'entity';

        /**
         * @property {string} id - Unique entity identifier.
         */
        this.id = data.id;
        /**
         * @property {shared.utils.Hashmap} attrs - Hashmap over the entities attributes.
         */
        this.attrs = new Hashmap(data.attrs);
        /**
         * @property {shared.core.ComponentManager} components - Component manager instance.
         */
        this.components = new ComponentManager(this);
        /**
         * @property {object} config - Game configuration.
         */
        this.config = config;
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
     * Triggers the synchronization event for the entity.
     * @method shared.core.Entity#sync
     * @param {object} attrs - Attributes to synchronize.
     */
    , sync: function(attrs) {
        this.trigger('entity.sync', [attrs, this]);
    }
    /**
     * Triggers the damage event for the entity.
     * @method shared.core.Entity#damage
     * @param {number} amount - Amount of damage.
     * @param {shared.core.Entity} attacker - Entity attacking.
     */
    , damage: function(amount, attacker) {
        this.trigger('entity.damage', [amount, attacker, this]);
    }
    /**
     * Triggers the kill event for the entity.
     * @method shared.core.Entity#kill
     * @param {shared.core.Entity} other - Entity killed.
     */
    , kill: function(other) {
        this.trigger('entity.kill', [other, this]);
    }
    /**
     * Triggers the die event for the entity.
     * @method shared.core.Entity#die
     */
    , die: function() {
        this.trigger('entity.die', [this]);
    }
    /**
     * Triggers the revive event for the entity.
     * @method shared.core.Entity#revive
     */
    , revive: function() {
        this.trigger('entity.revive', [this]);
    }
    /**
     * Triggers the remove event the entity (and kills the entity).
     * @method shared.core.Entity#remove
     */
    , remove: function() {
        this.die();
        this.trigger('entity.remove', [this]);
    }
    /**
     * Serializes this entity to a JSON object.
     * @method shared.core.Entity#serialize
     */
    , serialize: function() {
        return {
            id: this.id
            , key: this.key
            , attrs: this.attrs.get()
        };
    }
});

module.exports = Entity;

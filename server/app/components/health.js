'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , HealthComponent;

/**
 * Health component class.
 * @class server.components.HealthComponent
 * @classdesc Component that adds support for having health.
 * @extends shared.core.Component
 */
HealthComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'health';
        this.phase = ComponentBase.prototype.phases.LOGIC;

        // internal properties
        this._maxHealth = 0;
        this._currentHealth = 0;
        this._alive = true;
    }
    /**
     * @override
     */
    , init: function() {
        this._maxHealth = this.owner.attrs.get('maxHealth');
        this._currentHealth = this._maxHealth;

        this.owner.on('entity.damage', this.onEntityDamage.bind(this));
        this.owner.on('entity.revive', this.onEntityRevive.bind(this));
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        // update the aliveness for the entity
        this._alive = this._currentHealth > 0;

        // kill the entity if it should not be alive anymore
        if (this._alive === false && this.owner.attrs.get('alive')) {
            this.owner.die();
        }

        // update entity attributes
        this.owner.attrs.set({
            alive: this._alive
            , maxHealth: this._maxHealth
            , currentHealth: this._currentHealth
        });
    }
    /**
     * Event handler for when entity is taking damage.
     * @method server.components.HealthComponent#onEntityDamage
     * @param {number} amount - Amount of damage taken.
     * @param {shared.core.Entity} attack - Entity attacking.
     */
    , onEntityDamage: function(amount, attacker) {
        this._currentHealth -= amount;

        if (this._currentHealth <= 0) {
            attacker.kill(this.owner);
        }
    }
    /**
     * Event handler for when entity is revived.
     * @method server.components.HealthComponent#onEntityRevive
     */
    , onEntityRevive: function() {
        this._currentHealth = this._maxHealth;
    }
});

module.exports = HealthComponent;

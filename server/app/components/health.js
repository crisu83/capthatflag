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

        // internal properties
        this._max = 0;
        this._current = 0;
    }
    /**
     * @override
     */
    , init: function() {
        this._max = this.owner.attrs.get('maxHealth');
        this._current = this._max;

        this.owner.on('entity.damage', this.onEntityDamage.bind(this));
        this.owner.on('entity.revive', this.onEntityRevive.bind(this));
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.owner.attrs.set({maxHealth: this._max, currentHealth: this._current});
    }
    /**
     * Event handler for when entity is taking damage.
     * @method server.components.HealthComponent#onEntityDamage
     * @param {number} amount - Amount of damage taken.
     */
    , onEntityDamage: function(amount) {
        console.log('damage taken', this.owner.id);
        this._current - amount;

        if (this._current <= 0) {
            this.owner.die();
        }
    }
    /**
     * Event handler for when entity is revived.
     * @method server.components.HealthComponent#onEntityRevive
     */
    , onEntityRevive: function() {
        this._current = this._max;
    }
});

module.exports = HealthComponent;

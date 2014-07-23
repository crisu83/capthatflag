'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/player')
    , PlayerComponent;

/**
 * Player component class.
 * @class server.components.PlayerComponent
 * @classdesc Component that adds player functionality.
 * @extends shared.core.Component
 */
PlayerComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {server.core.Team} team - Team instance.
     */
    constructor: function(team) {
        ComponentBase.apply(this);

        // internal properties
        this._team = team;
        this._kills = 0;
        this._deaths = 0;
        this._respawnSec = null;
        this._lastDeadAt = null;
    }
    /**
     * @override
     */
    , init: function() {
        this._respawnSec = this.owner.attrs.get('respawnSec');

        this.owner.on('entity.kill', this.onEntityKill.bind(this));
        this.owner.on('entity.die', this.onEntityDeath.bind(this));
    }
    /**
     * Event handler for when the entity kills another entity.
     * @method server.components.PlayerComponent#onEntityKill
     */
    , onEntityKill: function(other) {
        this._kills++;
    }
    /**
     * Event handler for when the entity dies.
     * @method server.components.PlayerComponent#onEntityDeath
     */
    , onEntityDeath: function() {
        this._deaths++;
        this._lastDeadAt = _.now();
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        this.owner.attrs.set({kills: this._kills, deaths: this._deaths});

        if (this.canRevive()) {
            this.owner.attrs.set({x: this._team.x, y: this._team.y});
            this.owner.revive();
            this._lastDeadAt = null;
        }
    }
    /**
     * Returns whether the entity can be revived.
     * @method server.components.PlayerComponent#canRevive
     * @return {boolean} The result.
     */
    , canRevive: function() {
        return this._lastDeadAt && (_.now() - this._lastDeadAt) > (this._respawnSec * 1000);
    }
});

module.exports = PlayerComponent;

'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/attack')
    , Body = require('../../../shared/physics/body')
    , AttackComponent;

/**
 * Attack component class.
 * @class server.components.AttackComponent
 * @classdesc Component that adds the ability to attack other entities.
 * @extends shared.components.AttackComponent
 */
AttackComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // internal properties
        this._team = null;
        this._body = null;
        this._physics = null;
        this._lastAttackAt = null;
    }
    /**
     * @override
     */
    , init: function() {
        this._team = this.owner.attrs.get('team');
        this._body = new Body('attack', this.owner);
        this._physics = this.owner.components.get('physics');
    }
    /**
     * @override
     */
    , attack: function() {
        if (this.canAttack()) {
            var target = this.calculateTarget()
                , aoe = this.owner.attrs.get('attackAoe')
                , amount = this.owner.attrs.get('damage')
                , playerTeam = this.owner.attrs.get('team')
                , halfAoe = aoe / 2
                , otherTeam;

            this._body.x = target.x - halfAoe;
            this._body.y = target.y - halfAoe;
            this._body.width = aoe;
            this._body.height = aoe;

            this._physics.overlap('player', function(body, other) {
                otherTeam = other.owner.attrs.get('team');

                // make sure that we are not hitting our teammates
                if (!_.isUndefined(otherTeam) && playerTeam !== otherTeam && other.owner.attrs.get('alive')) {
                    other.owner.damage(amount, this.owner);
                    console.log('   player %s hit opponent %s for %d', body.owner.id, other.owner.id, amount);
                }
            }, this, this._body/* use the attack body instead of the entity body */);
        }
    }
});

module.exports = AttackComponent;

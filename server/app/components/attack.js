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
    }
    /**
     * @override
     */
    , init: function() {
        var io = this.owner.components.get('io');
        io.spark.on('entity.attack', this.onAttack.bind(this));

        this._team = this.owner.attrs.get('team');
        this._body = new Body('attack', this.owner);
        this._physics = this.owner.components.get('physics');
    }
    /**
     * Event handler for when the entity is attacking.
     * @method server.components.AttackComponent#onAttack
     */
    , onAttack: function() {
        var target = this.calculateTarget()
            , aoe = this.owner.attrs.get('attackAoe')
            , halfAoe = aoe / 2
            , amount = 0;

        this._body.x = target.x - halfAoe;
        this._body.y = target.y - halfAoe;
        this._body.width = aoe;
        this._body.height = aoe;

        this._physics.overlap('player', function(body, other) {
            // make sure that we are not hitting our teammates
            if (this._team !== other.owner.attrs.get('team')) {
                amount = this.calculateDamage();
                console.log('player %s hit opponent %s for %d', body.owner.id, other.owner.id, amount);
                other.owner.damage(amount);
            }
        }, this, this._body/* use the attack body instead of the entity body */);
    }
    /**
     * Calculates the amount of damage done.
     * @method server.components.AttackComponent#calculateDamage
     */
    , calculateDamage: function() {
        // TODO implement some logic for missing and critical hits

        return this.owner.attrs.get('maxDamage');
    }
});

module.exports = AttackComponent;

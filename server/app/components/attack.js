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
        this._body = null;
        this._physics = null;
    }
    /**
     * @override
     */
    , init: function() {
        var io = this.owner.components.get('io');
        io.spark.on('entity.attack', this.onAttack.bind(this));

        this._body = new Body('attack', this.owner);
        this._physics = this.owner.components.get('physics');
    }
    /**
     * Event handler for when the entity is attacking.
     * @method server.components.AttackComponent#onAttack
     */
    , onAttack: function() {
        var target = this.calculateTarget()
            , aoe = this.owner.attrs.get('aoe')
            , halfAoe = aoe / 2;

        this._body.x = target.x - halfAoe;
        this._body.y = target.y - halfAoe;
        this._body.width = aoe;
        this._body.height = aoe;

        this._physics.overlap('player', function(body, other) {
            // make sure that we are not hitting our teammates
            if (body.owner.attrs.get('team') !== other.owner.attrs.get('team')) {
                console.log('player %s hit opponent %s', body.owner.id, other.owner.id);
            }
        }, this, this._body);
    }
});

module.exports = AttackComponent;

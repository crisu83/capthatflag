'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/attack')
    , AttackComponent;

/**
 * Attack component class.
 * @class server.components.AttackComponent
 * @classdesc Component that adds the ability to attack other entities.
 * @extends shared.components.AttackComponent
 */
AttackComponent = utils.inherit(ComponentBase, {
    /**
     * @override
     */
    init: function() {
        var io = this.owner.components.get('io');
        io.spark.on('entity.attack', this.onAttack.bind(this));
    }
    /**
     * Event handler for when the entity is attacking.
     * @method server.components.AttackComponent#onAttack
     */
    , onAttack: function() {
        var target = this.calculateTarget();
        console.log(target);
    }
});

module.exports = AttackComponent;

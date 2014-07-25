'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/attack')
    , AttackComponent;

/**
 * Attack component class.
 * @class client.components.AttackComponent
 * @classdesc Component that adds the ability to attack other entities.
 * @extends shared.components.AttackComponent
 */
AttackComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // internal properties
        this._sprite = null;
    }
    /**
     * @override
     */
    , init: function() {
        this._sprite = this.owner.components.get('sprite');

        var sprite = this._sprite.get('attack');
        sprite.animations.add('idle', [6]);
        sprite.animations.add('slash', [0, 1, 2, 3, 4, 5, 6]);
        sprite.animations.play('idle');
    }
    /**
     * @override
     */
    , attack: function() {
        var now = _.now()
            , target = this.calculateTarget()
            , position = {x: target.x - 16, y: target.y - 10};

        this._sprite.setPosition('attack', position);
        this._sprite.playAnimation('attack', 'slash', 30);

        this.setLastAttackAt(now);
    }
});

module.exports = AttackComponent;

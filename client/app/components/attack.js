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
     * @param {Phaser.InputManager} input - Input manager instance.
     */
    constructor: function(input) {
        ComponentBase.apply(this);

        // internal properties
        this._input = input;
        this._io = null;
        this._sprite = null;
        this._attackEnabled = true;
    }
    /**
     * @override
     */
    , init: function() {
        var attackKey = this._input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        attackKey.onDown.add(this.onAttackDown.bind(this));
        attackKey.onUp.add(this.onAttackUp.bind(this));

        this._io = this.owner.components.get('io');
        this._sprite = this.owner.components.get('sprite');

        var sprite = this._sprite.get('attack');
        sprite.animations.add('idle', [6]);
        sprite.animations.add('slash', [0, 1, 2, 3, 4, 5, 6]);
        sprite.animations.play('idle');
    }
    /**
     * Event handler for when the attack button is pressed.
     * @method client.components.AttackComponent#onAttackDown
     */
    , onAttackDown: function() {
        if (this._attackEnabled && this.canAttack()) {
            var now = _.now();

            this.attack();
            this.setLastAttackAt(now);
        }
    }
    /**
     * Event handler for when the attack button is relased.
     * @method client.components.AttackComponent#onAttackUp
     */
    , onAttackUp: function() {
        this._attackEnabled = true;
    }
    /**
     * Performs an attack.
     * @method client.components.AttackComponent#attack
     */
    , attack: function() {
        var target = this.calculateTarget()
            , position = {x: target.x - 16, y: target.y - 10};

        this._sprite.setPosition('attack', position);
        this._sprite.playAnimation('attack', 'slash', 30);

        this._io.spark.emit('entity.attack');

        this._attackEnabled = false;
    }
});

module.exports = AttackComponent;

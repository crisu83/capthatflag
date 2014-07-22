'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , AttackComponent;

/**
 * Attack component class.
 * @class client.components.AttackComponent
 * @classdesc Component that adds the ability to attack other entities.
 * @extends shared.core.Component
 */
AttackComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new attack component.
     * @constructor
     * @param {Phaser.InputManager} input - Input manager instance.
     */
    constructor: function(sprite, input) {
        ComponentBase.apply(this);

        sprite.animations.add('idle', [4]);
        sprite.animations.add('slash', [0, 1, 2, 3, 4]);
        sprite.animations.play('idle');

        // inherited properties
        this.key = 'attack';
        this.phase = ComponentBase.prototype.phases.LOGIC;

        // internal properties
        this._sprite = sprite;
        this._input = input;
        this._attackEnabled = true;
    }
    /**
     * @override
     */
    , init: function() {
        var attackKey = this._input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        attackKey.onDown.add(this.onAttackDown.bind(this));
        attackKey.onUp.add(this.onAttackUp.bind(this));
    }
    /**
     * Event handler for when the attack button is pressed.
     * @method client.components.AttackComponent#onAttackDown
     */
    , onAttackDown: function() {
        if (this._attackEnabled) {
            this.attack();
            this._attackEnabled = false;
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
        var position = this.owner.attrs.get(['x', 'y'])
            , dimensions = this.owner.attrs.get(['width', 'height'])
            , direction = this.owner.attrs.get('direction')
            , range = this.owner.attrs.get('range')
            , halfWidth = dimensions.width / 2
            , halfHeight = dimensions.height / 2;

        position.x += halfWidth;
        position.y += halfHeight;

        switch (direction) {
            case 'left':
                position.x -= halfWidth + range;
                break;
            case 'up':
                position.y -= halfHeight + range;
                break;
            case 'right':
                position.x += halfWidth + range;
                break;
            case 'down':
                position.y += halfHeight + range;
                break;
            default:
                break;
        }

        console.log('player attacking', position.x, position.y);

        this._sprite.x = position.x - 16;
        this._sprite.y = position.y - 10;
        this._sprite.animations.play('slash', 20);
    }
});

module.exports = AttackComponent;

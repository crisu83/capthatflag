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
     * @param {Phaser.Sprite} crossair - Crossair sprite instance.
     * @param {Phaser.InputManager} input - Input manager instance.
     */
    constructor: function(crossair, input) {
        ComponentBase.apply(this);

        crossair.animations.add('idle', [0]);
        crossair.animations.add('attack', [1]);

        // inherited properties
        this.key = 'attack';
        this.phase = ComponentBase.prototype.phases.LOGIC;

        /**
         * @property {Phaser.Sprite} crossair - Crossair sprite instance.
         */
        this.crossair = crossair;
        /**
         * @property {Phaser.InputManager} input - Input manager instance.
         */
        this.input = input;
        /**
         * @property {number} crossairDistance - Distance between the crossair and the owner.
         */
        this.crossairDistance = 48;
        /**
         * @property {number} cooldownMsec - Number of milliseconds before the owner can attack again.
         */
        this.cooldownMsec = 200;

        // internal properties
        this._angle = 0;
        this._hasAttacked = false;
        this._lastAttackAt = null;
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        var now = _.now()
            , position = this.owner.attrs.get(['x', 'y']);

        this._angle = this.angleToPointer(position);

        this.crossair.x = position.x + 8 + (this.crossairDistance * Math.cos(this._angle));
        this.crossair.y = position.y + 8 + (this.crossairDistance * Math.sin(this._angle));

        this._lastAttackAt = this._lastAttackAt || now;

        // check if we are attacking (and can attack)
        if (this.input.activePointer.isDown && this.canAttack()) {
            this.attack();
            this._hasAttacked = true;
            this._lastAttackAt = now;
        }

        if (this.input.activePointer.isUp) {
            this._hasAttacked = false;
        }

        if (now - this._lastAttackAt > 200) {
            this.crossair.animations.play('idle', 20, true);
        }
    }
    /**
     * Returns whether the owner can attack.
     * @method client.components.AttackComponent#canAttack
     * @return {boolean} The result.
     */
    , canAttack: function() {
        return !this._hasAttacked && _.now() - this._lastAttackAt > this.cooldownMsec;
    }
    /**
     * Performs an attack.
     * @method client.components.AttackComponent#attack
     */
    , attack: function() {
        this.crossair.animations.play('attack', 20);
        console.log('player attacking', this.crossair.x, this.crossair.y);
    }
    /**
     * Resolves the angle from the given position to the mouse cursor.
     * @method client.components.AttackComponent#angleToPointer
     * @param {object} position - Origo.
     * @return {number} Angle to the cursor.
     */
    , angleToPointer: function(position) {
        // TODO Move to the World class (physics)
        var pointer = this.input.activePointer
            , dx = pointer.worldX - position.x
            , dy = pointer.worldY - position.y;

        return Math.atan2(dy, dx);
    }
});

module.exports = AttackComponent;

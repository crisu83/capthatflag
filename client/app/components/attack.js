'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , AttackComponent;

AttackComponent = utils.inherit(ComponentBase, {
    /**
     * TODO
     * @constructor
     */
    constructor: function(crossair, input) {
        crossair.z = 1000; // make sure that the crossair is above the owner

        this.key = 'attack';
        this.phase = ComponentBase.prototype.phases.LOGIC;
        this.crossair = crossair;
        this.input = input;
        this.offset = 48;
        this.angle = 0;
        this.cooldownMsec = 200;
        this._lastAttackAt = null;
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        var now = _.now()
            , position = this.owner.attrs.get(['x', 'y']);

        this.angle = this.angleToPointer(position);

        this.crossair.x = position.x + 8 + (this.offset * Math.cos(this.angle));
        this.crossair.y = position.y + 8 + (this.offset * Math.sin(this.angle));

        this._lastAttackAt = this._lastAttackAt || now;

        // check if we are attacking (and can attack)
        if (this.input.activePointer.isDown && this.canAttack()) {
            this.attack();
            this._lastAttackAt = now;
        }
    }
    /**
     * TODO
     * @method client.components.AttackComponent#canAttack
     */
    , canAttack: function() {
        return _.now() - this._lastAttackAt > this.cooldownMsec;
    }
    /**
     * TODO
     * @method client.components.AttackComponent#attack
     */
    , attack: function() {
        console.log('player attacking', this.crossair.x, this.crossair.y);
    }
    /**
     * TODO
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

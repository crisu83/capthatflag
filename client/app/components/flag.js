'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/flag')
    , FlagComponent;

/**
 * Flag component class.
 * @class client.components.FlagComponent
 * @classdesc Component that adds flag functionality.
 * @extends shared.core.Component
 */
FlagComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // internal properties
        this._sprite = null;
        this._team = 'neutral';
    }
    /**
     * @override
     */
    , init: function() {
        this._sprite = this.owner.components.get('sprite');

        var sprite = this._sprite.get('flag');
        sprite.animations.add('neutral', [0]);
        sprite.animations.add('red', [1]);
        sprite.animations.add('blue', [2]);
        sprite.animations.play('neutral', 20, true);
    }
    /**
     * @override
     */
    , update: function() {
        var team = this.owner.attrs.get('team');

        if (team !== this._team) {
            this._sprite.playAnimation('flag', team, 20, true);
            this._team = team;
        }
    }
});

module.exports = FlagComponent;

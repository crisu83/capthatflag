'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/banner')
    , BannerComponent;

/**
 * Banner component class.
 * @class client.components.BannerComponent
 * @classdesc Component that adds banner functionality.
 * @extends shared.core.Component
 */
BannerComponent = utils.inherit(ComponentBase, {
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
        
        var sprite = this._sprite.get('banner');
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
            this._sprite.playAnimation('banner', team, 20, true);
            this._team = team;
        }
    }
});

module.exports = BannerComponent;

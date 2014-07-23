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
     * @param {Phaser.Sprite} sprite - Banner sprite.
     */
    constructor: function(sprite) {
        ComponentBase.apply(this);

        sprite.animations.add('neutral', [0]);
        sprite.animations.add('red', [1]);
        sprite.animations.add('blue', [2]);

        // internal properties
        this._sprite = sprite;
        this._team = 'neutral';
    }
    /**
     * @override
     */
    , update: function() {
        var team = this.owner.attrs.get('team');

        if (team !== this._team) {
            this._sprite.animations.play(team, 20, true);
            this._team = team;
        }
    }
});

module.exports = BannerComponent;

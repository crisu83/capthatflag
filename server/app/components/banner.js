'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/banner')
    , BannerComponent;

/**
 * Banner component class.
 * @class server.components.BannerComponent
 * @classdesc Component that adds banner functionality.
 * @extends shared.components.BannerComponent
 */
BannerComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function(room) {
        ComponentBase.apply(this);

        // internal properties
        this._room = room;
        this._physics = null;
        this._team = 'neutral';
    }
    /**
     * @override
     */
    , init: function() {
        this._physics = this.owner.components.get('physics');
    }
    /**
     * @override
     */
    , update: function(elapsed) {
        var playerTeam;

        this._physics.overlap('player', function(body, other) {
            playerTeam = other.owner.attrs.get('team');
            if (!_.isUndefined(playerTeam) && playerTeam !== this._team && other.owner.attrs.get('alive')) {
                this._room.captureFlag(this.owner.id, this._team, playerTeam);

                console.log('   player %s captured flag %s %s => %s', other.owner.id, body.owner.id, this._team, playerTeam);
                this._team = playerTeam;
            }
        }, this);

        // update entity attributes
        this.owner.attrs.set({team: this._team});
    }
});

module.exports = BannerComponent;

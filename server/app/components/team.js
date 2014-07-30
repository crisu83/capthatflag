'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , TeamComponent;

/**
 * Team component class.
 * @class server.components.TeamComponent
 * @classdesc Component that adds team functionality.
 * @extends shared.components.TeamComponent
 */
TeamComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     * @param {server.core.Team} team - Team instance.
     */
    constructor: function(team) {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'team';
        this.phase = ComponentBase.prototype.phases.LOGIC;

        // internal properties
        this._team = team;
    }
    /**
     * @override
     */
    , init: function() {

    }
    /**
     * @override
     */
    , update: function(elapsed) {
        // update entity attributes
        this.owner.attrs.set({
            teamName: this._team.name
            , teamColor: this._team.color
        });
    }
});

module.exports = TeamComponent;

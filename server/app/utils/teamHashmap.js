'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , BaseHashmap = require('../../../shared/utils/hashmap')
    , TeamHashmap;

/**
 * TODO
 */
TeamHashmap = utils.inherit(BaseHashmap, {
    /**
     * Returns the currently weakest team.
     * @method server.utils.TeamHashmap#findWeakest
     * @return {server.core.Team} Team instance.
     */
    findWeakest: function() {
        var weakest, teamSize, leastPlayers;

        this.each(function(team) {
            teamSize = team.size();
            if (_.isUndefined(leastPlayers) || teamSize < leastPlayers) {
                leastPlayers = teamSize;
                weakest = team;
            }
        }, this);

        return weakest;
    }
    /**
     * TODO
     */
    , calculateScores: function() {
        var scores = [];

        this.each(function(team) {
            scores.push({team: team.name, points: team.getTotalPoints()});
        }, this);

        return scores;
    }
});

module.exports = TeamHashmap;

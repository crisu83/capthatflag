'use strict';

var utils = require('../../../shared/utils')
    , List = require('../../../shared/utils/list')
    , Team;

/**
 * Team class.
 * @class server.core.Team
 * @classdesc Team of players.
 */
Team = utils.inherit(null, {
    /**
     * Creates a new team.
     * @constructor
     * @param {string} name - Team name.
     * @param {number} x - Starting position on the x-axis.
     * @param {number} y - Starting position on the y-axis.
     */
    constructor: function(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this._players = new List();
    }
    /**
     * Adds a new player to the team.
     * @method server.core.Team#addPlayer
     * @param {shared.core.Entity} player - Player entity.
     */
    , addPlayer: function(player) {
        player.on('entity.remove', this.onEntityRemove.bind(this));
        this._players.add(player);
    }
    /**
     * Awards points to players on the team.
     * @method server.core.Team#awardPointsToPlayers
     * @param {number} points - Amount of points.
     */
    , awardPointsToPlayers: function(points) {
        this._players.each(function(player, playerId) {
            player.trigger('player.awardPoints', [points]);
        }, this);
    }
    /**
     * Resets points for players on the team.
     * @method server.core.Team#resetPointsForPlayers
     */
    , resetPointsForPlayers: function() {
        this._players.each(function(player, playerId) {
            player.trigger('player.resetPoints');
        }, this);
    }
    /**
     * Removes all the players from the team.
     * @method server.core.Team#removePlayers
     */
    , removePlayers: function() {
        this._players.clear();
    }
    /**
     * Event handler for when a player is removed.
     * @method server.core.Team#onEntityRemove
     * @param {shared.core.Entity} entity - Entity instance.
     */
    , onEntityRemove: function(entity) {
        this._players.remove(entity);
    }
    /**
     * Returns the amount of players in the team.
     * @method server.core.Team#size
     * @return {number} The result.
     */
    , size: function() {
        return this._players.size();
    }
});

module.exports = Team;

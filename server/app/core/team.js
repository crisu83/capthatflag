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
     * @param {object} data - Team data.
     */
    constructor: function(data) {
        /**
         * @property {string} name - Team name.
         */
        this.name = data.name;
        /**
         * @property {string} color - Team color.
         */
        this.color = data.color;

        // internal properties
        this._players = new List();
        this._x = data.x;
        this._y = data.y;
    }
    /**
     * Returns the spawn position for players on the team.
     * @method server.core.Team#spawnPosition
     * @return {object} Spawn position object.
     */
    , spawnPosition: function() {
        return {x: this._x, y: this._y};
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
     * Event handler for when a player is removed.
     * @method server.core.Team#onEntityRemove
     * @param {shared.core.Entity} entity - Entity instance.
     */
    , onEntityRemove: function(entity) {
        this._players.remove(entity);
    }
    /**
     * Awards points to players on the team.
     * @method server.core.Team#awardPointsToPlayers
     * @param {number} points - Amount of points.
     */
    , awardPointsToPlayers: function(points) {
        this._players.each(function(player) {
            player.trigger('player.awardPoints', points);
        }, this);
    }
    /**
     * Resets points for players on the team.
     * @method server.core.Team#resetPointsForPlayers
     */
    , resetPointsForPlayers: function() {
        this._players.each(function(player) {
            player.trigger('player.resetPoints');
        }, this);
    }
    /**
     * TODO
     */
    , getTotalPoints: function() {
        var points = 0;

        this._players.each(function(player) {
            points += player.attrs.get('points');
        }, this);

        return points;
    }
    /**
     * Removes all the players from the team.
     * @method server.core.Team#removePlayers
     */
    , removePlayers: function() {
        this._players.clear();
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

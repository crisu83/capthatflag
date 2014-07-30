'use strict';

var utils = require('../../../shared/utils')
    , List = require('../../../shared/utils/list')
    , config = require('../config.json')
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
     * @param {server.core.Base} base - Base instance.
     * @param {server.core.Room} room - Room instance.
     */
    constructor: function(data, base, room) {
        /**
         * @property {string} name - Team name.
         */
        this.name = data.name;
        /**
         * @property {string} color - Team color.
         */
        this.color = data.color;
        /**
         * @property {number} points - Team points.
         */
        this.points = 0;

        // internal properties
        this._base = base;
        this._players = new List();
        this._room = room;
    }
    /**
     * Returns a position within the team base.
     * @method server.core.Team#spawnPosition
     * @return {object} Position object.
     */
    , spawnPosition: function() {
        return {
            x: this._room.chance.integer({min: this._base.x, max: this._base.right() - config.gameTileSize})
            , y: this._room.chance.integer({min: this._base.y, max: this._base.bottom() - config.gameTileSize})
        };
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
            player.trigger('player.receivePoints', points);
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
     * Returns the amount of players in the team.
     * @method server.core.Team#size
     * @return {number} The result.
     */
    , size: function() {
        return this._players.size();
    }
    /**
     * TODO
     */
    , resetPoints: function() {
        this.points = 0;
    }
    /**
     * TODO
     */
    , serialize: function() {
        return {
            name: this.name
            , color: this.color
            , points: this.points
            , playerCount: this._players.size()
        };
    }
});

module.exports = Team;

'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , Entity = require('../../../shared/core/entity')
    , DataManager = require('./dataManager')
    , Body = require('../../../shared/physics/body')
    , IoComponent = require('../../../shared/components/io')
    , PhysicsComponent = require('../../../shared/components/physics')
    , AttackComponent = require('../components/attack')
    , HealthComponent = require('../components/health')
    , InputComponent = require('../components/input')
    , PlayerComponent = require('../components/player')
    , FlagComponent = require('../components/flag')
    , EntityFactory;

/**
 * Entity factory static class.
 * @class server.core.EntityFactory
 * @classdesc Factory class for creating entities.
 */
EntityFactory = {
    room: null
    /**
     * Creates a new entity.
     * @method server.core.EntityFactory#create
     * @param {string} key - Entity type.
     * @return {shared.core.Entity} Entity instance.
     */
    , create: function(key) {
        var data = this.loadData(key)
            , entity = null;

        switch (key) {
            case 'flag':
                entity = this.createFlag(data);
                break;
            default:
                break;
        }

        return entity;
    }
    /**
     * Create a new player entity.
     * @method server.core.EntityFactory#createPlayer
     * @param {Primus.Spark} spark - Spark instance.
     * @return {shared.core.Entity} Entity instance.
     */
    , createPlayer: function(spark) {
        var data = this.loadData('player')
            , entity = new Entity(data)
            , team = this.room.teams.findWeakest()
            , body = new Body(data.key, entity);

        // set initial entity attributes
        entity.attrs.set({
            name: this.room.generatePlayerName()
        });

        entity.components.add(new IoComponent(spark));
        entity.components.add(new PhysicsComponent(body, this.room.world));
        entity.components.add(new AttackComponent());
        entity.components.add(new InputComponent());
        entity.components.add(new HealthComponent());
        entity.components.add(new PlayerComponent(team));

        team.addPlayer(entity);

        return entity;
    }
    /**
     * Create a new flag entity.
     * @method client.core.EntityFactory#createFlag
     * @return {shared.core.Entity} Entity instance.
     */
    , createFlag: function(data) {
        var entity = new Entity(data)
            , body = new Body(data.key, entity);

        entity.components.add(new PhysicsComponent(body, this.room.world));
        entity.components.add(new FlagComponent(this.room));
        this.room.flagCount++;

        return entity;
    }
    /**
     * Loads data for a specific entity.
     * @method server.core.EntityFactory#loadData
     * @param {string} key - Entity type.
     * @return {object} Entity data.
     */
    , loadData: function(key) {
        var data = DataManager.getEntity(key);
        return {id: shortid.generate(), key: data.key, attrs: _.clone(data.attrs)};
    }
};

module.exports = EntityFactory;

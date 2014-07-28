'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , Entity = require('../../../shared/core/entity')
    , Body = require('../../../shared/physics/body')
    , IoComponent = require('../../../shared/components/io')
    , PhysicsComponent = require('../../../shared/components/physics')
    , AttackComponent = require('../components/attack')
    , FlagComponent = require('../components/flag')
    , PlayerComponent = require('../components/player')
    , SpriteComponent = require('../components/sprite')
    , TextComponent = require('../components/text')
    , SyncComponent = require('../components/sync')
    , EntityFactory;

/**
 * Entity factory static class.
 * @class client.core.EntityFactory
 * @classdesc Factory class for creating entities.
 * @property {Primus.Client} primus - Primus client instance.
 * @property {shared.physics.World} world - World instance.
 * @property {Phaser.State} state - State instance.
 * @property {Phaser.Group} entityGroup - Entity group.
 * @property {Phaser.Group} effectGroup - Effect group.
 */
EntityFactory = {
    primus: null
    , world: null
    , state: null
    , entityGroup: null
    , effectGroup: null
    /**
     * Creates a new entity.
     * @method client.core.EntityFactory#create
     * @return {shared.core.Entity} Entity instance.
     */
    , create: function(data) {
        var entity = null;

        switch (data.key) {
            case 'player':
                entity = this.createPlayer(data);
                break;
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
     * @method client.core.EntityFactory#createPlayer
     * @return {shared.core.Entity} Entity instance.
     */
    , createPlayer: function(data) {
        var entity = new Entity(data)
            , sprites, texts, body, color, nameText;

        sprites = {
            player: this.entityGroup.create(data.attrs.x, data.attrs.y, data.attrs.image)
            , grave: this.entityGroup.create(data.attrs.x, data.attrs.y, 'grave')
            , attack: this.effectGroup.create(data.attrs.x, data.attrs.y, 'attack-sword')
        };

        texts = {
            name: this.state.add.text(0, 0, '', {font: "10px Courier", stroke: "#000", strokeThickness: 5, fill: data.attrs.teamColor || '#aaa'})
            , respawn: this.state.add.text(0, 0, '', {font: "12px Courier", stroke: "#000", strokeThickness: 5, fill: '#aaa'})
        };

        body = new Body(data.key, entity);

        entity.components.add(new SpriteComponent(sprites));
        entity.components.add(new TextComponent(texts));
        entity.components.add(new PlayerComponent());
        entity.components.add(new IoComponent(this.primus));
        entity.components.add(new AttackComponent());
        entity.components.add(new PhysicsComponent(body, this.world));
        entity.components.add(new SyncComponent());

        return entity;
    }
    /**
     * Create a new flag entity.
     * @method client.core.EntityFactory#createFlag
     * @return {shared.core.Entity} Entity instance.
     */
    , createFlag: function(data) {
        var entity = new Entity(data)
            , sprites, body;

        sprites = {
            flag: this.entityGroup.create(data.attrs.x, data.attrs.y, data.attrs.image)
        };

        body = new Body(data.key, entity);

        entity.components.add(new SpriteComponent(sprites));
        entity.components.add(new FlagComponent());
        entity.components.add(new PhysicsComponent(body, this.world));
        entity.components.add(new SyncComponent());

        return entity;
    }
};

module.exports = EntityFactory;

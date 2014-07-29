'use strict';

var _ = require('lodash')
    , shortid = require('shortid')
    , Entity = require('../../../shared/core/entity')
    , Body = require('../../../shared/physics/body')
    , IoComponent = require('../../../shared/components/io')
    , PhysicsComponent = require('../../../shared/components/physics')
    , AttackComponent = require('../components/attack')
    , FlagComponent = require('../components/flag')
    , InputComponent = require('../components/input')
    , PlayerComponent = require('../components/player')
    , SoundComponent = require('../components/sound')
    , SpriteComponent = require('../components/sprite')
    , TextComponent = require('../components/text')
    , SyncComponent = require('../components/sync')
    , EntityFactory;

/**
 * Entity factory static class.
 * @class client.core.EntityFactory
 * @classdesc Factory class for creating entities.
 * @property {Phaser.State} state - State instance.
 */
EntityFactory = {
    state: null
    /**
     * Creates a new entity.
     * @method client.core.EntityFactory#create
     * @return {shared.core.Entity} Entity instance.
     */
    , create: function(data) {
        var entity = null;

        switch (data.key) {
            case 'player':
                entity = this.createRemotePlayer(data);
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
     * Create a new local player entity.
     * @method client.core.EntityFactory#createLocalPlayer
     * @return {shared.core.Entity} Entity instance.
     */
    , createLocalPlayer: function(data) {
        var entity = new Entity(data)
            , sprites, sounds, texts, body;

        sprites = {
            player: this.state.entityGroup.create(data.attrs.x, data.attrs.y, data.attrs.image)
            , grave: this.state.entityGroup.create(data.attrs.x, data.attrs.y, 'grave')
            , attack: this.state.effectGroup.create(data.attrs.x, data.attrs.y, 'attack-sword')
        };

        sounds = {
            hit: this.state.add.audio('hit', 0.1, false)
            , die: this.state.add.audio('die', 0.1, false)
        };

        texts = {
            name: this.state.add.text(0, 0, '', {font: "10px Courier", stroke: "#000", strokeThickness: 5, fill: data.attrs.teamColor || '#aaa'})
            , respawn: this.state.add.text(0, 0, '', {font: "12px Courier", stroke: "#000", strokeThickness: 5, fill: '#aaa'})
        };

        body = new Body(data.key, entity);

        entity.components.add(new PhysicsComponent(body, this.state.foo));
        entity.components.add(new SpriteComponent(sprites));
        entity.components.add(new SoundComponent(sounds));
        entity.components.add(new TextComponent(texts));
        entity.components.add(new PlayerComponent());
        entity.components.add(new IoComponent(this.state.primus));
        entity.components.add(new AttackComponent());
        entity.components.add(new InputComponent(this.state.input));

        this.state.camera.follow(sprites.player);

        return entity;
    }
    /**
     * Create a new remote player entity.
     * @method client.core.EntityFactory#createRemotePlayer
     * @return {shared.core.Entity} Entity instance.
     */
    , createRemotePlayer: function(data) {
        var entity = new Entity(data)
            , sprites, sounds, texts, body;

        sprites = {
            player: this.state.entityGroup.create(data.attrs.x, data.attrs.y, data.attrs.image)
            , grave: this.state.entityGroup.create(data.attrs.x, data.attrs.y, 'grave')
            , attack: this.state.effectGroup.create(data.attrs.x, data.attrs.y, 'attack-sword')
        };

        sounds = {
            hit: this.state.add.audio('hit', 0.1, false)
            , die: this.state.add.audio('die', 0.1, false)
        };

        texts = {
            name: this.state.add.text(0, 0, '', {font: "10px Courier", stroke: "#000", strokeThickness: 5, fill: data.attrs.teamColor || '#aaa'})
            , respawn: this.state.add.text(0, 0, '', {font: "12px Courier", stroke: "#000", strokeThickness: 5, fill: '#aaa'})
        };

        body = new Body(data.key, entity);

        entity.components.add(new PhysicsComponent(body, this.state.foo));
        entity.components.add(new SpriteComponent(sprites));
        entity.components.add(new SoundComponent(sounds));
        entity.components.add(new TextComponent(texts));
        entity.components.add(new PlayerComponent());
        entity.components.add(new IoComponent(this.state.primus));
        entity.components.add(new AttackComponent());
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
            flag: this.state.entityGroup.create(data.attrs.x, data.attrs.y, data.attrs.image)
        };

        body = new Body(data.key, entity);

        entity.components.add(new PhysicsComponent(body, this.state.foo));
        entity.components.add(new SpriteComponent(sprites));
        entity.components.add(new FlagComponent());
        entity.components.add(new SyncComponent());

        return entity;
    }
};

module.exports = EntityFactory;

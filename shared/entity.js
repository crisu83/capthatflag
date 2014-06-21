'use strict';

var utils = require('./utils')
    , Node = require('./node')
    , SortedList = require('./sortedList');

// base entity class
var Entity = utils.inherit(Node, {
    key: 'entity'
    , x: null
    , y: null
    , width: null
    , height: null
    , speed: 0
    , image: null
    , components: null
    // constructor
    , constructor: function(x, y, image) {
        Node.apply(this);

        this.x = x;
        this.y = y;
        this.image = image;
        this.components = new SortedList(function(a, b) {
            return a.phase < b.phase;
        });
    }
    // load assets for this entity
    , preload: function(game) {

    }
    // runs creation logic for this entity
    , create: function(game) {

    }
    // updates the logic for this entity
    , update: function(game) {
        // update the components (that are already sorted)
        for (var i = 0; i < this.components.items.length; i++) {
            this.components.get(i).update(game);
        }
    }
    // adds a component to this entity
    , addComponent: function(component) {
        component.owner = this;
        component.init();
        this.components.add(component);
    }
    // get a component that belongs to this entity
    , getComponent: function(key) {
        var i, component;
        for (i = 0; i < this.components.size(); i++) {
            component = this.components.get(i);
            if (component.key === key) {
                return component;
            }
        }

        return null;
    }
    // kills off this entity
    , die: function() {
        this.trigger('entity.die');
    }
    // converts this entity to a json object
    , toJSON: function() {
        return {
            x: this.x
            , y: this.y
            , width: this.width
            , height: this.height
            , speed: this.speed
            , image: this.image
        };
    }

    // sets properties for this entity from a json object
    , fromJSON: function(json) {
        this.x = json.x;
        this.y = json.y;
        this.width = json.width;
        this.height = json.height;
        this.speed = json.speed;
        this.image = json.image;
    }
});

module.exports = Entity;

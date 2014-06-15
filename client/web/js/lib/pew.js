'use strict';

// Declare namespace.
var Pew = Pew || {};

/**
 * Pew utilities.
 * @type {Object}
 */
Pew.Utils = {
    /**
     * Creates a new object by inheriting another object.
     * @param {Object} parent
     * @param {Object} props
     * @returns {Object}
     */
    inherit: function (parent, props) {
        parent = parent || function() {};
        var child;
        if (props && _.has(props, 'constructor')) {
            child = props.constructor;
        } else {
            child = function() { return parent.apply(this, arguments) };
        }
        child.prototype = Object.create(parent.prototype);
        if (props) {
            _.extend(child.prototype, props);
        }
        child.__super__ = parent.prototype;
        return child;
    },
    /**
     * Creates a new game with support for CocoonJS.
     * @param {number} width
     * @param {number} height
     * @param {number} renderer
     * @param {string|HTMLElement} parent
     * @param {boolean} transparent
     * @param {boolean} antialias
     * @returns {Phaser.Game}
     */
    cocoon: function(width, height, renderer, parent, transparent, antialias) {
        var gameWidth = width,
            gameHeight = height,
            isCocoonJS = Phaser.Device.cocoonJS;

        if (isCocoonJS) {
            width = window.innerWidth;
            height = window.innerHeight;
        }

        return new Phaser.Game(width, height, renderer, parent, {
            /**
             * Creates the game.
             * @param {Phaser.Game} game
             */
            create: function(game) {
                if (isCocoonJS) {
                    var ratios = {
                        x: width / gameWidth,
                        y: height / gameHeight
                    };
                    var scale = ratios.x > ratios.y ? ratios.x : ratios.y;
                    game.world._container.scale.x = scale;
                    game.world._container.scale.y = scale;
                    game.world._container.updateTransform();
                }
            }
        }, transparent, antialias);
    }
};

/**
 * Collection utility class.
 * @class Pew.Collection
 */
Pew.Collection = Pew.Utils.inherit(null, {
    /**
     * Creates a new collection.
     * @param {Array} items
     * @constructor
     */
    constructor: function (items) {
        this.items = items || [];
    },

    /**
     * Adds an item to this collection.
     * @param {*} item
     */
    add: function (item) {
        this.items.push(item);
    },

    /**
     * Returns a specific item in this collection.
     * @param {Number} index
     * @returns {*}
     */
    get: function (index) {
        return this.items[index];
    },

    /**
     * Removes a specific item from this collection.
     * @param {*} item
     */
    remove: function (item) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i] === item) {
                this.items.splice(i, 1);
            }
        }
    },

    /**
     * Removes all items from this collection.
     */
    clear: function () {
        this.items.length = 0;
    },

    /**
     * Returns the number of items in this collection.
     * @returns {Number}
     */
    count: function () {
        return this.items.length;
    },

    /**
     * Returns all the items in this collection.
     * @returns {Array}
     */
    getItems: function () {
        return this.items;
    }
});

/**
 * Base object class.
 * @class Pew.Object
 */
Pew.Object = Pew.Utils.inherit(null, {
    /**
     * Base class.
     */
    constructor: function(game) {
        this.game = game;
    },

    /**
     * Returns the current state.
     * @returns {Phaser.State}
     */
    getState: function() {
        return this.game.state.getCurrentState();
    }
});

/**
 * Entity base class.
 * @class Pew.Entity
 * @augments Pew.Object
 */
Pew.Entity = Pew.Utils.inherit(Pew.Object, {
    /**
     * Performs preloading of this entity.
     */
    preload: function () {},

    /**
     * Invoked when the game is created.
     */
    create: function () {},

    /**
     * Invoked when the game is updated.
     */
    update: function () {}
});

/**
 * Entity group base class.
 * @class Pew.EntityGroup
 * @augments Pew.Object
 */
Pew.EntityGroup = Pew.Utils.inherit(Pew.Object, {
    /**
     * Creates a new entity group.
     * @param {Phaser.Game} game
     * @constructor
     */
    constructor: function(game) {
        Pew.Object.prototype.constructor.apply(this, arguments);
        this.entities = [];
    },

    /**
     * Adds an entity to this group.
     * @param {Entity} entity
     */
    add: function(entity) {
        this.entities.push(entity);
    },

    /**
     * Performs preloading for this group.
     */
    preload: function () {
        for (var i = 0, l = this.entities.length; i < l; i++) {
            this.entities[i].preload();
        }
    },

    /**
     * Invoked when the game is created.
     */
    create: function () {
        for (var i = 0, l = this.entities.length; i < l; i++) {
            this.entities[i].create();
        }
    },

    /**
     * Invoked when the game is updated.
     */
    update: function () {
        for (var i = 0, l = this.entities.length; i < l; i++) {
            this.entities[i].update();
        }
    }
});

/**
 * Stage base class.
 * @class Pew.State
 * @augments Phaser.State
 */
Pew.State = Pew.Utils.inherit(Phaser.State, {
    /**
     * Creates the stage.
     */
    create: function() {
        if (!navigator.isCocoonJS) {
            this.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
            this.game.stage.scale.pageAlignHorizontally = true;
            this.game.stage.scale.pageAlignVertically = true;
            this.game.stage.scale.setScreenSize(true);
        }
    }
});
var utils = require('../utils')
    , Body;

/**
 * TODO
 * @class shared.physics.Body
 */
Body = utils.inherit(null, {
    /**
     * TODO
     * @constructor
     */
    constructor: function(entity) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
    /**
     * TODO
     * @method shared.physics.Body#right
     */
    , right: function() {
        return this.x + this.width;
    }
    /**
     * TODO
     * @method shared.physics.Body#bottom
     */
    , bottom: function() {
        return this.y + this.height;
    }
});

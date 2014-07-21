var utils = require('../utils')
    , Body;

Body = utils.inherit(null, {
    constructor: function(entity) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
    , right: function() {
        return this.x + this.width;
    }
    , bottom: function() {
        return this.y + this.height;
    }
});

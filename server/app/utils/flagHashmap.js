'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , BaseHashmap = require('../../../shared/utils/hashmap')
    , FlagHashmap;

/**
 * TODO
 */
FlagHashmap = utils.inherit(BaseHashmap, {
    /**
     * TODO
     */
    captureFlag: function(key, from, to) {
        // check that the target team exists
        if (this.exists(to)) {
            var toFlags = this.get(to);

            // check if the flag was captured
            if (this.exists(from)) {
                var fromFlags = this.get(from)
                    , index = fromFlags.indexOf(key);

                if (index !== -1) {
                    fromFlags.splice(index, 1);
                }
            }

            toFlags.push(key);
            return true;
        }

        return false;
    }
    /**
     * TODO
     */
    , serialize: function() {
        var result = {};

        this.each(function(flags, team) {
            result[team] = flags;
        }, this);

        return result;
    }
});

module.exports = FlagHashmap;

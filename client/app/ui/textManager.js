'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , Hashmap = require('../../../shared/utils/hashmap')
    , TextManager;

/**
 * TODO
 */
TextManager = utils.inherit(null, {
    /**
     * TODO
     */
    constructor: function() {
        this._texts = new Hashmap();
    }
    /**
     * TODO
     */
    , add: function(key, text) {
        this._texts.set(key, text);
    }
    /**
     * TODO
     */
    , changeText: function(key, string) {
        this._texts.get(key).text = string;
    }
});

module.exports = TextManager;

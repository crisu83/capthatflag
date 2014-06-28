'use strict';

var _ = require('lodash')
    , Entity = require('../../shared/entity');

// entity factory static class
var EntityFactory = {
    // creates a new entity
    create: function(socket, key) {
        var data = this.loadData(key)
            , entity = new Entity(socket, data);

        // todo: consider including components in the data and attaching them here

        return entity;
    }
    // loads data for a specific entity
    , loadData: function(key) {
        // return a clone so that we get a different reference
        // to the data for each entity
        var data = require('../data/entities/' + key + '.json');
        return _.clone(data);
    }
};

module.exports = EntityFactory;

'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
    , EntityBase = require('../../shared/entity');

// server entity class
var Entity = utils.inherit(EntityBase, {
    // updates the logic for this entity
    update: function() {
        EntityBase.prototype.update.apply(this, arguments);

        var state = this.state.next();
        if (state) {
            this.applyState(state);
        }
    }
    , getCurrentState: function(reset) {
        reset = reset || false;
        var state = null;
        if (this.state.current) {
            state = _.extend({}, {timestamp: this.state.current.timestamp}, this.attrs.get());

            if (reset) {
                this.state.reset();
            }
        }
        return state;
    }
});

module.exports = Entity;

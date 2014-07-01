'use strict';

var _ = require('lodash')
    , utils = require('../../shared/utils')
    , EntityBase = require('../../shared/entity')
    , Entity;

/**
 * Server entity class.
 * @class server.Entity
 * @classdesc Entity class for the server.
 * @extends shared.Entity
 */
Entity = utils.inherit(EntityBase, {
    /**
     * @override
     */
    update: function() {
        EntityBase.prototype.update.apply(this, arguments);

        var state = this.state.next();
        if (state) {
            this.applyState(state);
        }
    }
    /**
     * Returns the current state of this entity.
     * @param {boolean} reset whether to set the state to null afterwards
     * @return {object} current state, or null if no state is set
     */
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

define([
    'lodash'
    , 'shared/utils'
    , 'shared/entity'
], function(_, utils, EntityBase) {
    'use strict';

    /**
     * Client entity class.
     * @class client.Entity
     * @classdesc Entity class for the client.
     * @extends shared.Entity
     */
    var Entity = utils.inherit(EntityBase, {
        /**
         * Synchronizes the state of the this entity.
         * @method client.Entity#sync
         * @param {object} state synchronized entity state
         */
        sync: function(state) {
            // copy from the state (everything except the timestamp) to the attributes
            var attrs = _.omit(state, ['timestamp']);

            // delete the state because it is not needed anymore
            this.state.discardAt(state.timestamp);

            // apply all the unprocessed (future) states
            // this is also known as server reconcilation
            for (var i = 0; i < this.state._queue.length; i++) {
                attrs = this.simulateState(this.state._queue[i], attrs);
            }

            // Update attribute values and trigger the sync event
            this.attrs.set(attrs);
            this.trigger('entity.sync', [this.serialize()]);
        }
        /**
         * @override
         */
        , update: function(elapsed) {
            EntityBase.prototype.update.apply(this, arguments);

            if (this.state.hasChanged()) {
                var state = this.state.push(this.state.current);
                this.state.reset();
                this.socket.emit('player.state', state);
            }
        }
    });

    return Entity;
});

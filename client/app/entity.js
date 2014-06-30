define([
    'lodash'
    , 'shared/utils'
    , 'shared/entity'
], function(_, utils, EntityBase) {
    'use strict';

    // client entity class
    var Entity = utils.inherit(EntityBase, {
        // synchronizes the state of the this entity
        sync: function(state) {
            // copy from the state (everything except the timestamp) to the attributes
            var attrs = _.omit(state, ['timestamp']);

            // delete the state because it is not needed anymore
            this.state.removeAt(state.timestamp);

            // apply all the unprocessed (future) states
            // this is also known as server reconcilation
            for (var i = 0; i < this.state.queue.length; i++) {
                attrs = this.simulateState(this.state.queue[i], attrs);
            }

            this.attrs.set(attrs);

            // update attributes and trigger the sync event
            this.trigger('entity.sync', [this.serialize()]);
        }
        // updates the logic for this entity
        , update: function() {
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

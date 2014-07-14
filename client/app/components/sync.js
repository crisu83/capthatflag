'use strict';

var utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/component')
    , SyncComponent;

/**
 * Synchronization component class.
 * @class server.components.SyncComponent
 * @classdesc Component for synchronizing the associated entity over the network.
 * @extends shared.Component
 */
SyncComponent = utils.inherit(ComponentBase, {
    key: 'sync'
    , phase: ComponentBase.prototype.phases.LOGIC
    /**
     * TODO
     */
    , init: function() {
        this.owner.on('entity.sync', this.onEntitySync.bind(this));
    }
    /**
     * TODO
     */
    , onEntitySync: function(attrs) {
        this.owner.attrs.set(attrs);
    }
});

module.exports = SyncComponent;

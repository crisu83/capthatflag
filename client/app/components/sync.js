'use strict';

var utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/core/component')
    , SyncComponent;

/**
 * Synchronization component class.
 * @class client.components.SyncComponent
 * @classdesc Component that adds functionality synchronizing other players.
 * @extends shared.core.Component
 */
SyncComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // inherited properties
        this.key = 'sync';
        this.phase = ComponentBase.prototype.phases.LOGIC;
    }
    /**
     * @override
     */
    , init: function() {
        this.owner.on('entity.sync', this.onEntitySync.bind(this));
    }
    /**
     * Event handler for when the associated entity is synchronized.
     * @method client.components.SyncComponent#onEntitySync
     * @param {object} attrs - Synchronized attributes.
     */
    , onEntitySync: function(attrs) {
        this.owner.attrs.set(attrs);
    }
});

module.exports = SyncComponent;

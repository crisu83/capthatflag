define([
    'shared/utils'
    , 'shared/component'
], function(utils, ComponentBase) {
    // socket component class
    var IoComponent = utils.inherit(ComponentBase, {
        phase: ComponentBase.prototype.phases.IO
        , socket: null
        // constructor
        , constructor: function(socket) {
            this.key = 'io';
            this.socket = socket;
        }
    });

    return IoComponent;
});

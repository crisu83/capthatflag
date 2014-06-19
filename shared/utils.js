'use strict';

var _ = require('lodash');

// creates a new object by inheriting another object
function inherit(parent, props) {
    parent = parent || function() {};
    var child;
    if (props && _.has(props, 'constructor')) {
        child = props.constructor;
    } else {
        child = function() { return parent.apply(this, arguments); };
    }
    child.prototype = Object.create(parent.prototype);
    if (props) {
        _.extend(child.prototype, props);
    }
    child.__super__ = parent.prototype;
    return child;
}

module.exports = {
    inherit: inherit
};

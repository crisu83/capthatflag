'use strict';

var _ = require('lodash');

// creates a new object by inheriting another object
// while preseving the prototype chain
function inherit(parent, props) {
    // allow us to pass null as parent
    parent = parent || function() {};

    var child;

    // use the constructor from props if defined otherwise create
    // an empty constructor that calls the parent constructor
    if (props && _.has(props, 'constructor')) {
        child = props.constructor;
    } else {
        child = function() {
            return parent.apply(this, arguments);
        };
    }

    // create the object prototype from the parent prototype
    child.prototype = Object.create(parent.prototype);

    // add properties to the object prototype if applicable
    if (props) {
        _.extend(child.prototype, props);
    }

    child.__super__ = parent.prototype;
    return child;
}

function mixin() {
    // todo: implement this in order to support "multiple" inheritance
}

module.exports = {
    inherit: inherit
};

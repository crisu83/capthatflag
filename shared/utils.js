'use strict';

var _ = require('lodash');

/**
 * Creates the constructor for a new object by copying the properties
 * from a parent object keeping the prototype chain intact.
 * @param {function} parent parent constructor, or null if no parent
 * @param {object} proto prototype properties
 * @param {object} props properties to define
 * @return {function} constructor
 */
function inherit(parent, proto, props) {
    // allow us to pass null as parent
    parent = parent || function() {};

    var child;

    // use the constructor from props if defined otherwise create
    // an empty constructor that calls the parent constructor
    if (proto && _.has(proto, 'constructor')) {
        child = proto.constructor;
        delete proto.constructor;
    } else {
        child = function() { return parent.apply(this, arguments); };
    }

    // create the object prototype from the parent prototype
    child.prototype = Object.create(parent.prototype);

    // add properties to the object prototype if applicable
    if (proto) {
        _.extend(child.prototype, proto);
    }

    // define object properties
    /*
    for (var name in props) {
        if (props.hasOwnProperty(name)) {
            Object.defineProperty(child, name, props[name]);
        }
    }
    */

    return child;
}

/**
 * Performs linear interpolation using the given factor.
 * @param {number} a - First value.
 * @param {number} b - Second value.
 * @param {number} factor - Interpolation factor, should be between 0 and 1.
 * @return {number} Resuling value.
 */
function lerp(a, b, factor) {
    return (1 - factor) * a + factor * b;
}

module.exports = {
    inherit: inherit
    , lerp: lerp
};

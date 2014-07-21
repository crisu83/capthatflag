'use strict';

var _ = require('lodash');

/**
 * Creates the constructor for a new object by copying the properties
 * from a parent object keeping the prototype chain intact.
 * @param {function} parent parent constructor, or null if no parent
 * @param {object} props prototype properties
 * @return {function} constructor
 */
function inherit(parent, props) {
    // allow us to pass null as both parent and props
    parent = parent || function() {};
    props = props || {};

    var Child;

    // use the constructor provided with the given properties (if defined)
    // or create an empty constructor (that calls the parent constructor)
    if (_.has(props, 'constructor')) {
        Child = props.constructor;
    } else {
        Child = function() { return parent.apply(this, arguments); };
    }

    // create the object prototype from the parent prototype
    // and add properties to the resulting child object prototype
    Child.prototype = Object.create(parent.prototype);
    _.extend(Child.prototype, props);

    // fix the constructor reference (lost after calling Object.create)
    Child.prototype.constructor = Child;

    return Child;
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

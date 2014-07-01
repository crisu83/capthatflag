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
    // allow us to pass null as parent
    parent = parent || function() {};

    var child;

    // use the constructor from props if defined otherwise create
    // an empty constructor that calls the parent constructor
    if (props && _.has(props, 'constructor')) {
        child = props.constructor;
    } else {
        child = function() { return parent.apply(this, arguments); };
    }

    // create the object prototype from the parent prototype
    child.prototype = Object.create(parent.prototype);

    // add properties to the object prototype if applicable
    if (props) {
        _.extend(child.prototype, props);
    }

    return child;
}

module.exports = {
    inherit: inherit
};

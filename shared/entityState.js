var _ = require('lodash')
    , utils = require('./utils');

// entity state class
var EntityState = utils.inherit(null, {
    queue: null
    , current: null
    // constructor
    , constructor: function() {
        this.queue = [];
    }
    // adds variables to the current state
    , add: function(vars) {
        this.current = _.extend(this.current || {}, vars);
    }
    // returns the state at a given timestamp
    , getAt: function(timestamp) {
        for (var i = 0; i < this.queue.length; i++) {
            if (this.queue[i].timestamp === timestamp) {
                return this.queue[i];
            }
        }
        return null;
    }
    // removes a specific state from the queue
    , removeAt: function(timestamp) {
        var state = this.getAt(timestamp)
            , index = !!state && this.queue.indexOf(state);

        if (index) {
            this.queue.splice(index, 1);
        }
    }
    // pushes a state to the queue
    , push: function(state) {
        state.timestamp = state.timestamp || +new Date();
        this.queue.push(state);
        return state;
    }
    // takes the next state from the queue, sets it as the current state and returns it
    , next: function() {
        if (this.queue.length) {
            this.current = this.queue.shift();
        }
        return this.current;
    }
    // resets the current state
    , reset: function() {
        this.current = null;
    }
    // returns whether this state has changed
    , hasChanged: function() {
        return this.current !== null;
    }
});

module.exports = EntityState;

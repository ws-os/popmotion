/*
    Run physics simulation
*/
"use strict";

var calc = require('../utils/calc.js'),
    simulate = require('../action/simulate.js');

module.exports = {

    // [boolean]: Create an Action method for this rubix?
    createMethod: true,

    // [boolean]: Tell Redshift this rubix calculates a new velocity itself
    calculatesVelocity: true,
    
    /*
        Simulate the Value's per-frame movement
        
        @param [string]: Key of current value
        @param [Value]: Current value
        @param [object]: Collection of all Action values
        @param [object]: Action properties
        @param [Action]: Current Action
        @param [number]: Duration of frame in ms
        @return [number]: Calculated value
    */
    process: function (key, value, values, props, action, frameDuration) {
        value.velocity = simulate(value.simulate, value, frameDuration, action.started);
        return value.current + calc.speedPerFrame(value.velocity, frameDuration);
    },
    
    /*
        Has this action ended?
        
        Use a framecounter to see if Action has changed in the last x frames
        and declare ended if not
        
        @param [Action]
        @param [boolean]: Has Action changed?
        @return [boolean]: Has Action ended?
    */
    hasEnded: function (action, hasChanged) {
        var props = action.props();

        props.inactiveFrames = hasChanged ? 0 : props.inactiveFrames + 1;
        return (props.inactiveFrames > props.maxInactiveFrames);
    },
    
    /*
        Limit output to value range, if any
        
        If velocity is at or more than range, and value has a bounce property,
        run the bounce simulation
        
        @param [number]: Calculated output
        @param [Value]: Current Value
        @return [number]: Limit-adjusted output
    */
    limit: function (output, value) {
        var isOutsideMax = (output >= value.max),
            isOutsideMin = (output <= value.min),
            isOutsideRange = isOutsideMax || isOutsideMin;
        
        if (isOutsideRange) {
            output = calc.restricted(output, value.min, value.max);

            if (value.bounce) {
                value.velocity = simulate('bounce', value);

            } else if (value.capture) {
                simulate('capture', value, isOutsideMax ? value.max : value.min);
            }
        }
        
        return output;
    }
};
/*
 *  Demonstrate PinIn and PinOut Model
 *
 *  See ./README.md for setup
 */

"use strict";

var iotdb = require('iotdb');
var iot = iotdb.iot();

var pin_input = iot.connect({
    model: 'PinIn',
    init: {
        "value": {
            "din": 35,
        },
    },
});
var pin_output = iot.connect({
    model: 'PinOut',
    init: {
        "value": {
            "dout": 33,
        },
    },
});

/*
 *  General monitoring of what's happening internally
 */
var things = iot.things();
things.on("state", function(thing) {
    console.log("+", "state", thing.thing_id(), "\n ", thing.state("istate"));
});
things.on("meta", function(thing) {
    console.log("+", "meta", thing.thing_id(), "\n ", thing.state("meta"));
});
things.on("thing", function(thing) {
    console.log("+", "discovered", thing.thing_id(), "\n ", thing.state("meta"));
});

/**
 *  Note the "/" in front of "/value". This means extract
 *  the actual key called "value" from the state dictionary.
 */
pin_input.on("/value", function(thing, attriribute, value) {
    pin_output.set("/value", value);
});

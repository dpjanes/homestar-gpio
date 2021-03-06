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
    uuid: '90F8532E-E36D-47CE-96D5-5E9A2CB04FCC',
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
things.on("istate", function(thing) {
    console.log("+", "istate", thing.thing_id(), "\n ", thing.state("istate"));
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

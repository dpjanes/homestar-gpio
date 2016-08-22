/*
 *  Demonstrate PinIn model
 *
 *  See ./README.md for setup
 */

"use strict";

var iotdb = require('iotdb');
var iot = iotdb.iot();

var things = iot.connect({
    model: 'PinIn',
    uuid: '961C6D73-8AA6-4E31-B31C-8E07CCE9AEB3',
    init: {
        value: {
            din: 35
        },
    },
});
things.on("istate", function(thing) {
    console.log("+", "istate", thing.thing_id(), "\n ", thing.state("istate"));
});
things.on("meta", function(thing) {
    console.log("+", "meta", thing.thing_id(), "\n ", thing.state("meta"));
});
things.on("thing", function(thing) {
    console.log("+", "discovered", thing.thing_id(), "\n ", thing.state("meta"));
});



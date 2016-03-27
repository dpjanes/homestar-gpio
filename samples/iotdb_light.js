/*
 *  Demonstrate ValueBoolean model
 *
 *  See ./README.md for setup
 */

"use strict";

var iotdb = require('iotdb');
var iot = iotdb.iot();

var things = iot.connect({
    model: "ValueBoolean",
    bridge: "GPIOBridge",
    init: {
        value: {
            dout: 33
        },
    }
});

things.on("state", function(thing) {
    console.log("+", "state", thing.thing_id(), "\n ", thing.state("istate"));
});
things.on("meta", function(thing) {
    console.log("+", "meta", thing.thing_id(), "\n ", thing.state("meta"));
});
things.on("thing", function(thing) {
    console.log("+", "discovered", thing.thing_id(), "\n ", thing.state("meta"));
});

var count = 0;
setInterval(function() {
    things.set("value", count++ % 2);
}, 2500);

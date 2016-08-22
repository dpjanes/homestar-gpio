/*
 *  Demonstrate ValueBoolean model
 *
 *  See ./README.md for setup
 */

"use strict";

console.log("#", "this may not be working");

var iotdb = require('iotdb');
var iot = iotdb.iot();

var things = iot.connect({
    model: "ValueBoolean",
    bridge: "GPIOBridge",
    uuid: '357D446C-6E0C-4438-B230-8144079DB145',
    init: {
        value: {
            dout: 33
        },
    }
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

var count = 0;
setInterval(function() {
    things.set("value", count++ % 2);
}, 2500);

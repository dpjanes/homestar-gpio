/*
 *  Demonstrate PinOut models
 *
 *  See ./README.md for setup
 */

"use strict";

var iotdb = require('iotdb');
var iot = iotdb.iot();

var things = iot.connect({
    model: 'PinOut',
    uuid: 'A6A58781-8402-4D5B-99A4-8D5456E35D32',
    init: {
        "value": {
            "dout": 33,
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

var count = 0;
setInterval(function() {
    things.set("value", count++ % 2);
}, 2500);

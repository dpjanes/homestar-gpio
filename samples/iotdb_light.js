/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

var iotdb = require('iotdb');
var iot = iotdb.iot();

var things = iot.connect({
    model: "ValueBoolean",
    bridge: "GPIOBridge",
    pins: [
        {
            pin: 11,
            attribute: "value",
            output: true,
        },
    ]
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

/*
var count = 0;
setInterval(function() {
    things.set("value", count++ % 2);
}, 2500);
*/
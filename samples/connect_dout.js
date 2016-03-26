/*
 *  Demonstrate Digital Write
 *
 *  Connect an LED to RPI pin 33 / BCM pin 13
 *
 *  Prefer the iotdb_* versions
 */

"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;

const Bridge = require('../GPIOBridge').Bridge;

const exemplar = new Bridge({
    init: {
        "value": {
            "dout": 33,
        },
    },
});
exemplar.discovered = function (bridge) {
    console.log("+", "got one", bridge.meta());

    bridge.pulled = function(pulld) {
        console.log("+", "pulled", pulld);
    };

    bridge.connect({});

    var count = 0;
    setInterval(function() {
        bridge.push({
            "value": count++ % 2,
        }, _.noop);
    }, 1000);
};
exemplar.discover();

/*
 *  Demonstrate Digital Read
 *
 *  Connect buttons to Raspberry Pi pins 35 and/or 37 (BCM 19/26)
 *
 *  Prefer the iotdb_* versions
 */

"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;

const Bridge = require('../GPIOBridge').Bridge;

const bridge_instance = new Bridge({
    init: {
        "red": {
            "din": 35,
        },
        "blue": {
            "din": 37,
        },
    },
});
bridge_instance.discovered = function (bridge) {
    console.log("+", "got one", bridge.meta());

    bridge.pulled = function(pulld) {
        console.log("+", "pulled", pulld);
    };

    bridge.connect({});
};
bridge_instance.discover();

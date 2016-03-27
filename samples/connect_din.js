/*
 *  Test Digital Read
 *
 *  See ./README.md for setup
 */

"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;

const Bridge = require('../GPIOBridge').Bridge;

const bridge_instance = new Bridge({
    uuid: '14E328F9-8C2B-4645-B6D4-EDBC146330AF',
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

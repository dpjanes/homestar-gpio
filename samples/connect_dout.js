/*
 *  Test Digital Write
 *
 *  See ./README.md for setup
 */

"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;

const Bridge = require('../GPIOBridge').Bridge;

const exemplar = new Bridge({
    uuid: 'DEEC41A6-C3E2-4552-9945-FE9DDC11F82C',
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

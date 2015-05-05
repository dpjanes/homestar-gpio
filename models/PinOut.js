/*
 *  PinOut.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-30
 */

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('PinOut')
    .name("PinOut")
    .o("value", iotdb.boolean)
    .make();

exports.binding = {
    bridge: require('../GPIOBridge').Bridge,
    model: exports.Model,
    discover: false,
};

/*
 *  PinOut.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-30
 */

exports.binding = {
    bridge: require('../GPIOBridge').Bridge,
    model: require('./pin-out.json'),
    discover: false,
};

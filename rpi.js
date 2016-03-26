/*
 *  rpi.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-03-25
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

const Q = require('q')

const iotdb = require('iotdb');
const _ = iotdb._;

var gpio;
try {
    gpio = require('rpi-gpio');
} catch (x) {
};

const logger = iotdb.logger({
    name: 'homestar-gpio',
    module: 'rpi',
});

const RPi = function () {
    var self = this;
    self._code2iodd = {};
    self._pin2coded = {};
    self._errord = {};
};

RPi.prototype.setup = function (bridge, done) {
    var self = this;
    var promises = [];

   _.mapObject(bridge.initd.init, function(init_pind, code) {
        _.mapObject(init_pind, function(pin, mode) {
            var setup_promise = null;
            var write = null;
            var read = false;

            if (mode === "din") {
                setup_promise = Q.ninvoke(gpio, "setup", pin, gpio.DIR_IN, gpio.EDGE_BOTH);
                read = true;
            } else if (mode === "dout") {
                setup_promise = Q.ninvoke(gpio, "setup", pin, gpio.DIR_OUT);
                write = function(value, done) {
                    gpio.write(pin, value, done);
                };
            } else if (mode === "ain") {
            } else if (mode === "aout") {
            } else {
                logger.error({
                    method: "setup",
                    init_pind: init_pind,
                    mode: mode,
                    cause: "likely a user error when initially connecting to the Model",
                }, "unknown pin mode -- ignoring, but this is bad");
                return;
            }

            if (setup_promise) {
                promises.push(setup_promise);

                if (write) {
                    self._code2iodd[code] = {
                        write: write
                    };
                }

                if (read) {
                    self._pin2coded[pin] = code;
                }
            }
        });
    });

    Q.all(promises)
        .then(function() {
            done(null);
        })
        .catch(function(error) {
            done(error);
        });

};

RPi.prototype.connect = function (bridge, connectd) {
    var self = this;

    gpio.on('change', function(pin, value) {
        var code = self._pin2coded[pin];
        if (!code) {
            return;
        }

        if (!bridge.native) {
            return;
        }

        if (bridge.istate[code] === value) {
            return;
        }

        bridge.istate[code] = value;
        
        bridge.pulled(bridge.istate);
    });
};

RPi.prototype.push = function (bridge, pushd, done) {
    var self = this;
    var promises = [];

    _.mapObject(pushd, function(value, code) {
        var iod = self._code2iodd[code];
        if (!iod) {
            if (!self._errord[code]) {
                self._errord[code] = true;

                logger.error({
                    method: "push",
                    value: value,
                    code: code,
                    cause: "likely caller error",
                }, "this code is not recognized");
            };

            return;
        }

        if (!iod.write) {
            if (!self._errord[code]) {
                self._errord[code] = true;

                logger.error({
                    method: "push",
                    value: value,
                    code: code,
                    cause: "likely caller error",
                }, "this code cannot be pushed to");
            };

            return;
        }

        promises.push(Q.nfcall(iod.write, value));
    });

    Q.all(promises)
        .then(function() {
            done(null);
        })
        .catch(function(error) {
            done(error);
        });
};

RPi.prototype.pull = function (bridge) {
};

var __is_rpi;

var check = function () {
    if (!gpio) {
        return false;
    }

    if (__is_rpi === undefined) {
        __is_rpi = false;
        try {
            var contents = fs.readFileSync('/etc/os-release', 'utf8');
            if (contents.match(/^ID=raspbian$/m)) {
                __is_rpi = true;
            }
        } 
        catch (x) {
        }
        __is_rpi = true;
    }

    return __is_rpi;
};

/*
 *  API
 */
exports.check = check;
exports.Delegate = RPi;

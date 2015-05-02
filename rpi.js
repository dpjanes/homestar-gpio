/*
 *  rpi.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-05-1
 *
 *  Copyright [2013-2015] [David P. Janes]
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

var child_process = require('child_process')
var fs = require('fs')

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var logger = bunyan.createLogger({
    name: 'homestar-gpio',
    module: 'rpi',
});

var _run = function(argv, done) {
    var stdout = "";
    var stderr = "";

    var argv = argv.concat();
    var command = argv.splice(0, 1).pop();
    var process = child_process.spawn(command, argv);

    process.on('error', done);

    process.stdout.on('data', function (data) {
        stdout += data;
    });

    process.stderr.on('data', function (data) {
        stderr += data;
    });

    process.on('close', function (code) {
        if (code !== 0) {
            var error = new Error("command exited with non-0 status: " + code);
            error.code = code;

            done(error, stdout, stderr);
        } else {
            done(null, stdout, stderr);
        }
    });
}

var RPi = function () {
};

RPi.prototype.setup = function (self, done) {
    self._attributed = {};

    var waiting = self.initd.pins.length;
    var any_error;

    var _setup_done = function(error) {
        if (any_error) {
        } else if (error) {
            any_error = error;
            done(error);
        } else if (--waiting === 0) {
            done(null);
        }
    };


    for (var pi in self.initd.pins) {
        var pind = self.initd.pins[pi];
        if (!pind.pin) {
            _setup_done(new Error("all pins must define a .pin number"));
            break;
        }

        if (!pind.attribute) {
            _setup_done(new Error("all pins must define a .attribute code"));
            break;
        }

        self._attributed[pind.attribute] = pind;

        if (pind.output) {
            _run([ "gpio", "mode", "" + pind.pin, "out" ], _setup_done);
        } else if (pind.input) {
            _run([ "gpio", "mode", "" + pind.pin, "in" ], _setup_done);
        } else {
            _setup_done(new Error("all pins must define .output or .input"));
            break;
        }
    }
};

RPi.prototype.connect = function (self, connectd) {
    for (var pi in self.initd.pins) {
        var pind = self.initd.pins[pi];
        if (!pind.input)
            continue;
        }

        this.connect_input(self, pind);
    };
}

RPi.prototype._connect_pind = function (self, pind) {
    _run([ "gpio", "wfi", "" + pind.pin, "both", function(error) {
        if (error) {
            return;
        }

        _run([ "gpio", "read", "" + pind.pin, function(error, stdin, stdout) {
            if (!error) {
                console.log("HERE:AAA", stdin);
            }

            this._connect_pind(self, pnd);
        });
    });
}

RPi.prototype.push = function (self, pushd) {
    var _done = function(error) {
        if (error) {
            logger.error({
                method: "push",
                error: error,
            }, "error reported running GPIO command");
        }
    };

    for (var pi in self.initd.pins) {
        var pind = self.initd.pins[pi];
        var code = pind.attribute;
        var value = pushd[code];
        if (value === undefined) {
            continue;
        }

        _run([ "gpio", "write", "" + pind.pin, value ? "0": "1" ], _done);
    };
};

var __is_rpi;

var check = function () {
    var self = this;

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
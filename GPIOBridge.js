/*
 *  GPIOBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-30
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

var fs = require('fs')
try {
    var rpi_gpio = require('rpi-gpio');
} catch (x) {
    rpi_gpio = null;
}

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

// var template = require('template');

var logger = bunyan.createLogger({
    name: 'homestar-gpio',
    module: 'GPIOBridge',
});

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var GPIOBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/GPIOBridge/initd"), {
            poll: 30
        }
    );
    self.native = native;   

    if (self.native) {
        self.queue = _.queue("GPIOBridge");
    }
};

GPIOBridge.prototype = new iotdb.Bridge();

GPIOBridge.prototype.name = function () {
    return "GPIOBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
GPIOBridge.prototype.discover = function () {
    var self = this;

    if (!self.initd.pins) {
        logger.info({
            method: "discover",
            cause: "you must define 'pins' for the Thing - otherwise how would we know?",
        }, "no 'pins'");
    }

    logger.info({
        method: "discover",
        pins: self.initd.pins,
    }, "called");

    /*
     *  This is the core bit of discovery. As you find new
     *  thimgs, make a new GPIOBridge and call 'discovered'.
     *  The first argument should be self.initd, the second
     *  the thing that you do work with
     */
    /*
    var s = self._template();
    s.on('something', function (native) {
        self.discovered(new GPIOBridge(self.initd, native));
    });
     */
    var native;

    do {
        native = self._check_pi();
        if (native) {
            break;
        }

        /* default */
        native = self._make_command();
    } while (0);

    /* complex but it works - we want to do setup before the offical discovery */
    console.log("HERE:A");
    var bridge = new GPIOBridge(self.initd, native);

    console.log("HERE:B");
    bridge.native.setup(bridge, function(error) {
        console.log("HERE:C");
        if (error) {
            logger.error({
                method: "discover/native.setup",
                error: error,
            }, "error while setting up pins");
            return;
        }

        logger.info({
            method: "discover/native.setup",
        }, "discovered");
        self.discovered(bridge);
    });

};

var __is_rpi;

GPIOBridge.prototype._check_pi = function () {
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
    }

    if (__is_rpi) {
        return self._make_pi();
    }
};

GPIOBridge.prototype._make_pi = function () {
    if (!rpi_gpio) {
        return;
    }

    logger.error({
        method: "_make_pi",
    }, "made pi!");

    return {
        setup: function(bridge, done) {
            var pins = bridge.initd.pins;
            var waiting = pins.length;
            var any_error;

            console.log("B.1", waiting);
            var _setup_done = function(error) {
                console.log("B.done", error, waiting);
                if (any_error) {
                } else if (error) {
                    any_error = error;
                    done(error);
                } else if (--waiting === 0) {
                    done(null);
                }
            };

            
            console.log("B.2");
            for (var pi in pins) {
                console.log("B.3.1");
                var pind = pins[pi];
                if (!pind.pin) {
                    _setup_done(new Error("all pins must define a .pin number"));
                    break;
                }

                console.log("B.3.2");
                if (pind.output) {
                    console.log("B.4.1");
                    rpi_gpio.setup(pind.pin, rpi_gpio.DIR_OUT, _setup_done);
                } else if (pind.input) {
                    console.log("B.4.2");
                    rpi_gpio.setup(pind.pin, rpi_gpio.DIR_IN, _setup_done);
                } else {
                    console.log("B.4.3");
                    _setup_done(new Error("all pins must define .output or .input"));
                    break;
                }
            }
            console.log("B.4");
        },

        write: function(bridge) {
        },

        read: function(bridge) {
        },

        on: function(bridge) {
        },
    }
};

GPIOBridge.prototype._make_command = function () {
    return {
        setup: function(initd) {
            done(null);
        },

        write: function() {
        },

        read: function() {
        },

        on: function() {
        },
    }
};

/**
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
GPIOBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_connect(connectd);

    self._setup_polling();
    self.pull();
};

GPIOBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

GPIOBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
GPIOBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
GPIOBridge.prototype.push = function (pushd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_push(pushd);

    logger.info({
        method: "push",
        pushd: pushd
    }, "push");

    var qitem = {
        // if you set "id", new pushes will unqueue old pushes with the same id
        // id: self.number, 
        run: function () {
            self._push(pushd);
            self.queue.finished(qitem);
        }
    };
    self.queue.add(qitem);
};

/**
 *  Do the work of pushing. If you don't need queueing
 *  consider just moving this up into push
 */
GPIOBridge.prototype._push = function (pushd) {
    logger.info({
        method: "_push",
        pushd: pushd
    }, "push");
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
GPIOBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
GPIOBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing": _.id.thing_urn.unique("GPIO", self.native.uuid, self.initd.number),
        "schema:name": self.native.name || "GPIO",

        // "iot:number": self.initd.number,
        // "iot:device": _.id.thing_urn.unique("GPIO", self.native.uuid),
        // "schema:manufacturer": "",
        // "schema:model": "",
    };
};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
GPIOBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 */
GPIOBridge.prototype.configure = function (app) {};

/*
 *  API
 */
exports.Bridge = GPIOBridge;

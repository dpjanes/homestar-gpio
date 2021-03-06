/*
 *  GPIOBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-30
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

var fs = require('fs')
var child_process = require('child_process')

var rpi = require('./rpi');

var iotdb = require('iotdb');
var _ = iotdb._;

var logger = iotdb.logger({
    name: 'homestar-gpio',
    module: 'GPIOBridge',
});

/* --- constructor --- */

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var GPIOBridge = function (initd, native) {
    var self = this;

    self.initd = _.d.compose.shallow(
        initd,
        iotdb.keystore().get("bridges/GPIOBridge/initd"),
        {
            uuid: null, 
        }
    );

    self.native = native;

    if (self.native) {
        self.istate = {};
        if (!self.initd.uuid) {
            logger.error({
                method: "GPIOBridge",
                initd: self.initd,
                cause: "caller should initialize with an 'uuid', used to uniquely identify things over sessions",
            }, "missing initd.uuid - problematic");
        }
    }
};

GPIOBridge.prototype = new iotdb.Bridge();

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
GPIOBridge.prototype.discover = function () {
    var self = this;

    if (!self.initd.init) {
        console.log(self.initd);
        logger.error({
            method: "discover",
            cause: "you must define 'init' for the Thing - otherwise how would we know?",
        }, "no 'pins'");
    }

    logger.info({
        method: "discover",
        init: self.initd.init,
    }, "called");


    var bridge;
    var native;

    if (rpi.check()) {
        native = new rpi.Delegate();
        bridge = new GPIOBridge(self.initd, native);
    } else {
        return;
    }

    /* complex but it works - we want to do setup before the offical discovery */
    bridge._setup(function(error) {
        if (error) {
            logger.error({
                method: "discover/_setup",
                error: error,
            }, "error while setting up pins");
            return;
        }

        logger.info({
            method: "_setup",
        }, "discovered");

        self.discovered(bridge);
    });
};

/**
 */
GPIOBridge.prototype._setup = function (done) {
    this.native.setup(this, done);
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

    self.native.connect(self, connectd);

    process.nextTick(function() {
        self.pull();
    });
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
GPIOBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected", pushd));
        return;
    }

    self._validate_push(pushd, done);

    logger.info({
        method: "push",
        pushd: pushd
    }, "push");

    self.native.push(self, pushd, done);
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
GPIOBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    // self.native.pull(self);
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
        "iot:thing-id": _.id.thing_urn.unique("GPIO", self.initd.uuid),
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

"use strict";
var rewire = require("rewire");
var Pin = rewire("../lib/pin.js");
var Emitter = require("events").EventEmitter;
var sinon = require("sinon");

var fsStub = {
  readFile: function(path, encoding, cb) {
    cb(null, "Success!");
  },
  writeFile: function(path, encoding, cb) {
    if (cb) {
      cb(null, "Success!");
    }
  },
  open: function(path, flag, cb) {
    if (cb) {
      cb(null, 1);
    }
  }
};

Pin.__set__("fs", fsStub);

function restore(target) {
  for (var prop in target) {
    if (typeof target[prop].restore === "function") {
      target[prop].restore();
    }
  }
}


Pin.ABS_PATH = process.cwd() + "/";

exports["Pin"] = {
  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.write = sinon.spy(fsStub, "writeFile");

    this.pin = new Pin({
      addr: 1,
      modes: [0, 1, 4]
    });

    this.proto = {};

    this.proto.functions = [{
      name: "write"
    }, {
      name: "setup"
    }];

    this.proto.objects = [{
      name: "MODES"
    }];

    this.proto.strings = [];

    this.proto.numbers = [{
      name: "report"
    }, {
      name: "value"
    }, {
      name: "addr"
    }];

    this.instance = [{
      name: "mode"
    }, {
      name: "paths"
    }, {
      name: "mux"
    }, {
      name: "pwm"
    }];

    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  shape: function(test) {
    test.expect(
      this.proto.functions.length +
      // this.proto.objects.length +
      this.proto.strings.length +
      this.proto.numbers.length +
      this.instance.length
    );

    this.proto.functions.forEach(function(method) {
      test.equal(typeof this.pin[method.name], "function");
    }, this);

    // this.proto.objects.forEach(function(method) {
    //   test.equal(typeof this.pin[method.name], "object");
    // }, this);

    this.proto.strings.forEach(function(method) {
      test.equal(typeof this.pin[method.name], "string");
    }, this);

    this.proto.numbers.forEach(function(method) {
      test.equal(typeof this.pin[method.name], "number");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.pin[property.name], "undefined");
    }, this);

    test.done();
  },
  modeNull: function(test) {
    test.expect(1);

    test.equal(this.pin.mode, null);
    test.done();
  },
  ready: function(test) {
    test.expect(1);

    this.pin.on("ready", function() {
      test.ok(true);
      test.done();
    });
  },
  direction: function(test) {
    test.expect(4);

    test.equal(this.write.callCount, 3);

    test.deepEqual(
      this.write.args, [
        ["/sys/class/gpio/gpio51/drive", "strong"],
        ["/sys/class/gpio/gpio51/direction", "out"],
        ["/sys/class/gpio/gpio51/value", "0"]
      ]
    );

    this.pin.direction = "in";

    test.equal(this.write.callCount, 5);

    test.deepEqual(
      this.write.args, [
        ["/sys/class/gpio/gpio51/drive", "strong"],
        ["/sys/class/gpio/gpio51/direction", "out"],
        ["/sys/class/gpio/gpio51/value", "0"],
        ["/sys/class/gpio/gpio51/drive", "pullup"],
        ["/sys/class/gpio/gpio51/direction", "in"]
      ]
    );

    test.done();
  }
};

exports["Digital"] = {
  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.write = sinon.spy(fsStub, "writeFile");

    this.pin = new Pin({
      addr: 3,
      modes: [0, 1, 3, 4]
    });

    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  pin: function(test) {
    test.expect(3);

    test.equal(this.pin.isAnalog, false);

    // default not pwm
    test.equal(this.pin.isPwm, false);

    // default direction
    test.equal(this.pin.direction, "out");

    test.done();
  },
  pwm: function(test) {
    test.expect(1);

    test.ok(this.pin.pwm);

    test.done();
  }
};


exports["Analog"] = {
  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.write = sinon.spy(fsStub, "writeFile");

    this.pin = new Pin({
      addr: "A0",
      modes: [0, 1, 2],
      analogChannel: 0
    });

    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  pin: function(test) {
    test.expect(3);

    test.equal(this.pin.isAnalog, true);

    // default not pwm
    test.equal(this.pin.isPwm, false);

    // default direction
    test.equal(this.pin.direction, "out");

    test.done();
  },
  pwm: function(test) {
    test.expect(1);

    test.equal(this.pin.pwm, null);

    test.done();
  }
};


exports["PWM"] = {
  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.write = sinon.spy(fsStub, "writeFile");

    this.pin = new Pin({
      addr: 3,
      modes: [0, 1, 3, 4]
    });

    done();
  },
  tearDown: function(done) {
    restore(this);
    done();
  },
  pin: function(test) {
    test.expect(3);

    test.equal(this.pin.isAnalog, false);

    // default not pwm
    test.equal(this.pin.isPwm, false);

    // default direction
    test.equal(this.pin.direction, "out");

    test.done();
  },
  pwm: function(test) {
    test.expect(1);

    test.ok(this.pin.pwm);

    test.done();
  },
  isPwm: function(test) {
    test.expect(3);

    test.equal(this.write.callCount, 3);
    this.pin.isPwm = true;

    test.equal(this.write.callCount, 4);

    test.deepEqual(
      this.write.lastCall.args, ["/sys/class/gpio/gpio18/value", "0"]
    );

    test.done();
  }


};

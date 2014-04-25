"use strict";
var rewire = require("rewire");
var Galileo = rewire("../lib/galileo");
var Emitter = require("events").EventEmitter;
var sinon = require("sinon");

var fsStub = {
  readFile: function(path, encoding, cb) {
    cb(null, path, encoding);
  },
  writeFile: function(path, encoding, cb) {
    if (cb) {
      cb(null, "Success!");
    }
  },

  writeFileSync: function(path, encoding, cb) {
    if (cb) {
      cb(null, "Success!");
    }
  }
};

function Pin(dummy) {
  Emitter.call(this);

  if (Pin.DUMMY) {
    dummy = Pin.DUMMY;
  }

  this.addr = dummy.addr || 3;
  this.alias = typeof dummy.alias !== "undefined" ?
    dummy.alias : 3;
  this.analogChannel = typeof dummy.analogChannel !== "undefined" ?
    dummy.analogChannel : 3;
  this.direction = dummy.direction || "out";
  this.gpio = dummy.gpio || 18;
  this.isAnalog = dummy.isAnalog || false;
  this.isPwm = dummy.isPwm || false;
  this.pin = dummy.pin || 3;
  this.supportedModes = dummy.supportedModes || [0, 1, 3, 4];

  this.value = 0;
  this.report = 0;
  this.mode = null;

  this.paths = dummy.paths || {
    value: "/sys/class/gpio/gpio18/value",
    direction: "/sys/class/gpio/gpio18/direction",
    drive: "/sys/class/gpio/gpio18/drive",
    exported: "/sys/class/gpio/gpio18/"
  };

  this.mux = dummy.mux || [{
    gpio: 30,
    paths: {
      value: "/sys/class/gpio/gpio30/value",
      direction: "/sys/class/gpio/gpio30/direction",
      exported: "/sys/class/gpio/gpio30/",
      drive: "/sys/class/gpio/gpio30/drive"
    }
  }];

  this.pwm = dummy.pwm || {
    gpio: 3,
    paths: {
      duty_cycle: "/sys/class/pwm/pwmchip0/pwm3/duty_cycle",
      enable: "/sys/class/pwm/pwmchip0/pwm3/enable",
      period: "/sys/class/pwm/pwmchip0/pwm3/period",
      exported: "/sys/class/pwm/pwmchip0/pwm3/"
    }
  };

  process.nextTick(function() {
    this.emit("ready");
  }.bind(this));
}


Pin.DUMMY = null;

Pin.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Pin
  }
});
Pin.prototype.setup = function() {};
Pin.prototype.write = function(value) {
  this.value = value;
};


var analog = {
  addr: "A0",
  supportedModes: [0, 1, 2],
  analogChannel: 0,
  pin: "A0",
  gpio: 44,
  alias: 0,
  mux: [{
    gpio: 37,
    paths: {
      exported: "/sys/class/gpio/gpio37/",
      drive: "/sys/class/gpio/gpio37/drive",
      direction: "/sys/class/gpio/gpio37/direction",
      value: "/sys/class/gpio/gpio37/value"
    }
  }],
  pwm: {},
  paths: {
    exported: "/sys/class/gpio/gpio44/",
    drive: "/sys/class/gpio/gpio44/drive",
    direction: "/sys/class/gpio/gpio44/direction",
    value: "/sys/class/gpio/gpio44/value"
  },
  isAnalog: true,
  report: 0,
  value: 0,
  mode: null
};

Galileo.__set__("fs", fsStub);

Galileo.__set__("Pin", Pin);

function restore(target) {
  for (var prop in target) {
    if (typeof target[prop].restore === "function") {
      target[prop].restore();
    }
  }
}

exports["Galileo"] = {
  setUp: function(done) {

    this.clock = sinon.useFakeTimers();

    this.galileo = new Galileo();

    this.proto = {};

    this.proto.functions = [{
      name: "analogRead"
    }, {
      name: "analogWrite"
    }, {
      name: "digitalRead"
    }, {
      name: "digitalWrite"
    }, {
      name: "servoWrite"
    }];

    this.proto.objects = [{
      name: "MODES"
    }];

    this.proto.numbers = [{
      name: "HIGH"
    }, {
      name: "LOW"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "analogPins"
    }];

    done();
  },
  tearDown: function(done) {
    Galileo.reset();
    restore(this);
    done();
  },
  shape: function(test) {
    test.expect(
      this.proto.functions.length +
      this.proto.objects.length +
      this.proto.numbers.length +
      this.instance.length
    );

    this.proto.functions.forEach(function(method) {
      test.equal(typeof this.galileo[method.name], "function");
    }, this);

    this.proto.objects.forEach(function(method) {
      test.equal(typeof this.galileo[method.name], "object");
    }, this);

    this.proto.numbers.forEach(function(method) {
      test.equal(typeof this.galileo[method.name], "number");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.galileo[property.name], "undefined");
    }, this);

    test.done();
  },
  readonly: function(test) {
    test.expect(7);

    test.equal(this.galileo.HIGH, 1);

    test.throws(function() {
      this.galileo.HIGH = 42;
    });

    test.equal(this.galileo.LOW, 0);

    test.throws(function() {
      this.galileo.LOW = 42;
    });

    test.deepEqual(this.galileo.MODES, {
      INPUT: 0,
      OUTPUT: 1,
      ANALOG: 2,
      PWM: 3,
      SERVO: 4
    });

    test.throws(function() {
      this.galileo.MODES.INPUT = 42;
    });

    test.throws(function() {
      this.galileo.MODES = 42;
    });

    test.done();
  },
  emitter: function(test) {
    test.expect(1);
    test.ok(this.galileo instanceof Emitter);
    test.done();
  },
  connected: function(test) {
    test.expect(1);

    this.galileo.on("connect", function() {
      test.ok(true);
      test.done();
    });
  },
  ready: function(test) {
    test.expect(1);

    this.galileo.on("ready", function() {
      test.ok(true);
      test.done();
    });
  }
};


exports["Galileo.prototype.analogRead"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    Pin.DUMMY = analog;

    this.write = sinon.spy(Pin.prototype, "write");
    this.port = "/sys/bus/iio/devices/iio:device0/in_voltage0_raw";

    this.galileo = new Galileo();

    done();
  },
  tearDown: function(done) {
    Galileo.reset();

    restore(this);

    this.galileo.removeAllListeners("analog-read-A0");
    this.galileo.removeAllListeners("digital-read-9");

    done();
  },
  correctMode: function(test) {
    test.expect(1);

    // Reading from an ANALOG pin should set its mode to 1 ("out")
    this.galileo.analogRead("A0", function() {});

    test.equal(this.galileo.pins[14].mode, 1);

    test.done();
  },

  analogPin: function(test) {
    test.expect(2);

    // Reading from an ANALOG pin should set its mode to 1 ("out")
    var value = 1024;
    var scaled = value >> 2;


    this.readFile = sinon.stub(fsStub, "readFile", function(path, flags, cb) {
      cb(null, value);
    });

    var handler = function(data) {
      test.equal(data, scaled);
      test.done();
    };

    this.galileo.analogRead(0, handler);

    test.equal(this.galileo.pins[14].mode, 1);
  },

  port: function(test) {
    test.expect(1);

    var port = this.port;

    this.readFile = sinon.stub(fsStub, "readFile", function(path, flags, cb) {
      test.equal(port, path);
      test.done();
    });

    var handler = function(data) {};

    this.galileo.analogRead("A0", handler);
  },

  handler: function(test) {
    test.expect(1);

    var value = 1024;
    var scaled = value >> 2;


    this.readFile = sinon.stub(fsStub, "readFile", function(path, flags, cb) {
      cb(null, value);
    });

    var handler = function(data) {
      test.equal(data, scaled);
      test.done();
    };

    this.galileo.analogRead("A0", handler);
  },

  event: function(test) {
    test.expect(1);

    var value = 1024;
    var scaled = value >> 2;
    var event = "analog-read-0";

    this.readFile = sinon.stub(fsStub, "readFile", function(path, flags, cb) {
      cb(null, value);
    });

    this.galileo.once(event, function(data) {
      test.equal(data, scaled);
      test.done();
    });

    var handler = function(data) {};

    this.galileo.analogRead("A0", handler);
  }
};

exports["Galileo.prototype.digitalRead"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    Pin.DUMMY = null;
    this.write = sinon.spy(Pin.prototype, "write");
    this.port = "/sys/class/gpio/gpio18/value";

    this.galileo = new Galileo();

    done();
  },
  tearDown: function(done) {
    Galileo.reset();
    restore(this);

    this.galileo.removeAllListeners("analog-read-A0");
    this.galileo.removeAllListeners("digital-read-3");

    done();
  },
  correctMode: function(test) {
    test.expect(1);

    // Reading from a DIGITAL pin should set its mode to 0 ("in")
    this.galileo.digitalRead(3, function() {});

    test.equal(this.galileo.pins[3].mode, 0);

    test.done();
  },

  port: function(test) {
    test.expect(1);

    var port = this.port;

    this.readFile = sinon.stub(fsStub, "readFile", function(path, flags, cb) {
      test.equal(port, path);

      test.done();
    });

    var handler = function(data) {};

    this.galileo.digitalRead(3, handler);
  },

  handler: function(test) {
    test.expect(1);

    var value = 256;

    this.readFile = sinon.stub(fsStub, "readFile", function(path, flags, cb) {
      cb(null, value);
    });

    var handler = function(data) {
      test.equal(data, value);
      test.done();
    };

    this.galileo.digitalRead(3, handler);
  },

  event: function(test) {
    test.expect(1);

    var value = 256;
    var event = "digital-read-3";

    this.readFile = sinon.stub(fsStub, "readFile", function(path, flags, cb) {
      cb(null, value);
    });

    this.galileo.once(event, function(data) {
      test.equal(data, value);
      test.done();
    });

    var handler = function(data) {};

    this.galileo.digitalRead(3, handler);
  }
};


exports["Galileo.prototype.analogWrite"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    Pin.DUMMY = analog;
    this.write = sinon.spy(Pin.prototype, "write");
    // this.port = "/sys/class/gpio/gpio18/value";

    this.galileo = new Galileo();

    done();
  },
  tearDown: function(done) {
    Galileo.reset();
    restore(this);
    done();
  },

  mode: function(test) {
    test.expect(3);

    var value = 255;

    // Set pin to INPUT...
    this.galileo.pinMode("A0", 0);
    test.equal(this.galileo.pins[14].mode, 0);

    // Writing to a pin should change its mode to 1
    this.galileo.analogWrite("A0", value);
    test.equal(this.galileo.pins[14].mode, 3);
    test.equal(this.galileo.pins[14].isPwm, true);

    test.done();
  },

  write: function(test) {
    test.expect(2);

    var value = 255;

    this.galileo.analogWrite("A0", value);

    test.ok(this.write.calledOnce);
    test.deepEqual(this.write.firstCall.args, [value]);

    test.done();
  },

  stored: function(test) {
    test.expect(1);

    var value = 255;
    this.galileo.analogWrite("A0", value);

    test.equal(this.galileo.pins[14].value, value);

    test.done();
  }
};


exports["Galileo.prototype.digitalWrite"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    Pin.DUMMY = null;
    this.write = sinon.spy(Pin.prototype, "write");
    // this.port = "/sys/class/gpio/gpio18/value";

    this.galileo = new Galileo();

    done();
  },
  tearDown: function(done) {
    Galileo.reset();
    restore(this);
    done();
  },

  mode: function(test) {
    test.expect(3);

    var value = 1;

    // Set pin to INPUT...
    this.galileo.pinMode(3, 0);
    test.equal(this.galileo.pins[3].mode, 0);

    // Writing to a pin should change its mode to 1
    this.galileo.digitalWrite(3, value);
    test.equal(this.galileo.pins[3].mode, 1);
    test.equal(this.galileo.pins[3].isPwm, false);

    test.done();
  },

  write: function(test) {
    test.expect(2);

    var value = 1;

    this.galileo.digitalWrite(3, value);

    test.ok(this.write.calledOnce);
    test.deepEqual(this.write.firstCall.args, [value]);

    test.done();
  },

  stored: function(test) {
    test.expect(1);

    var value = 1;
    this.galileo.digitalWrite(3, value);

    test.equal(this.galileo.pins[3].value, value);

    test.done();
  }
};

exports["Galileo.prototype.servoWrite"] = {
  setUp: function(done) {
    done();
  },
  tearDown: function(done) {
    done();
  },
  alias: function(test) {
    test.expect(1);
    test.equal(
      Galileo.prototype.servoWrite,
      Galileo.prototype.analogWrite
    );
    test.done();
  }
};


exports["Galileo.prototype.pinMode (analog)"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    Pin.DUMMY = analog;

    // this.write = sinon.spy(Pin.prototype, "write");

    this.galileo = new Galileo();

    done();
  },
  tearDown: function(done) {
    restore(this);

    done();
  },
  analogOut: function(test) {
    test.expect(1);

    this.galileo.pinMode("A0", 1);

    test.equal(this.galileo.pins[14].mode, 1);

    test.done();
  },
  analogIn: function(test) {
    test.expect(3);

    this.galileo.pinMode("A0", 0);
    test.equal(this.galileo.pins[14].mode, 0);

    this.galileo.pinMode(0, 2);

    test.equal(this.galileo.pins[14].direction, "in");
    test.equal(this.galileo.pins[14].mode, 2);


    test.done();
  }
};

exports["Galileo.prototype.pinMode (digital)"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.galileo = new Galileo();

    done();
  },
  tearDown: function(done) {
    restore(this);

    done();
  },
  digitalOut: function(test) {
    test.expect(1);

    this.galileo.pinMode(3, 1);

    test.equal(this.galileo.pins[3].mode, 1);

    test.done();
  },
  digitalIn: function(test) {
    test.expect(1);

    this.galileo.pinMode(3, 0);

    test.equal(this.galileo.pins[3].mode, 0);

    test.done();
  }
};

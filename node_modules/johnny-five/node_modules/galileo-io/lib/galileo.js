var fs = require("fs");
var Emitter = require("events").EventEmitter;
var Promise = require("es6-promise").Promise;
var Pin = require("../lib/pin.js");
var tick = global.setImmediate || process.nextTick;

var modes = Object.freeze({
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
});

var pinModes = [
  { modes: [] },
  { modes: [] },
  { modes: [0, 1, 4] },
  { modes: [0, 1, 3, 4] },
  { modes: [0, 1, 4] },
  { modes: [0, 1, 3, 4] },
  { modes: [0, 1, 3, 4] },
  { modes: [0, 1, 4] },
  { modes: [0, 1, 4] },
  { modes: [0, 1, 3, 4] },
  { modes: [0, 1, 3, 4] },
  { modes: [0, 1, 3, 4] },
  { modes: [0, 1, 4] },
  { modes: [0, 1, 4] },
  { modes: [0, 1, 2], analogChannel: 0 },
  { modes: [0, 1, 2], analogChannel: 1 },
  { modes: [0, 1, 2], analogChannel: 2 },
  { modes: [0, 1, 2], analogChannel: 3 },
  { modes: [0, 1, 2], analogChannel: 4 },
  { modes: [0, 1, 2], analogChannel: 5 }
];

var boards = [];
var reporting = [];

/**
 * Several approaches where considered and attempted for
 * efficiently reading the value of GPIO or voltage ports
 * whose direction is "in".
 *
 * fs.watch: does not report changes made by the system
 *
 * gaze: does not report changes made by the system
 *
 */

tick(function read() {
  tick(read);
  var board;

  // TODO: Limit to one read cycle per ms?
  // Seriously, patches welcome for better approaches
  // that maintain the semantics.
  //
  if (boards.length && reporting.length) {
    board = boards[0];

    reporting.forEach(function(report, gpio) {

      fs.readFile(report.path, "utf8", function(err, value) {
        if (!err) {
          value = +value;

          if (report.scale) {
            value = report.scale(value);
          }

          board.pins[report.index].value = value;
          board.emit(report.event, value);
        }
      });
    });
  }
});

function ToPinIndex(pin) {
  var offset = pin[0] === "A" ? 14 : 0;
  return ((pin + "").replace("A", "") | 0) + offset;
}

function Galileo(opts) {
  Emitter.call(this);

  if (!(this instanceof Galileo)) {
    return new Galileo(opts);
  }
  var awaiting = [];

  this.name = "Galileo-IO";
  this.isReady = false;

  this.pins = pinModes.map(function(pin, index) {
    pin.addr = typeof pin.analogChannel === "number" ?
      "A" + pin.analogChannel : index;

    var gpio = new Pin(pin);

    awaiting.push(
      new Promise(function(resolve) {
        gpio.on("ready", function() {
          resolve();
        });
      })
    );

    return gpio;
  }, this);

  this.analogPins = this.pins.slice(14).map(function(pin, i) {
    return i;
  });

  boards[0] = this;

  // The "ready event" is needed to signal to Johnny-Five that
  // communication with the Arduino pinouts is ready.
  Promise.all(awaiting).then(function() {
    this.isReady = true;
    this.emit("connect");
    this.emit("ready");
  }.bind(this));
}

Galileo.reset = function() {
  reporting.length = 0;
};

Galileo.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Galileo
  },
  MODES: {
    value: modes
  },
  HIGH: {
    value: 1
  },
  LOW: {
    value: 0
  }
});

Galileo.prototype.pinMode = function(pin, mode) {
  var pinIndex;
  var gpioMode;
  var direction;

  gpioMode = mode = +mode;

  // Normalize ANALOG (input) mode to INPUT
  if (mode === 2) {
    gpioMode = 0;

    if (typeof pin === "number") {
      pin = "A" + pin;
    }
  }

  pinIndex = ToPinIndex(pin);
  direction = gpioMode ? "out" : "in";

  this.pins[pinIndex].mode = mode;
  this.pins[pinIndex].direction = direction;

  if (mode === 3 || mode === 4) {
    this.pins[pinIndex].isPwm = true;
  }

  return this;
};

Galileo.prototype.analogRead = function(pin, handler) {
  var pinIndex;
  var gpio;
  var alias;
  var event;

  // Convert numeric analog pin numbers to "A*" format
  if (typeof pin === "number") {
    pin = "A" + pin;
  }

  pinIndex = ToPinIndex(pin);
  gpio = this.pins[pinIndex].gpio;
  alias = this.pins[pinIndex].analogChannel;
  event = "analog-read-" + alias;

  if (this.pins[pinIndex].mode !== this.MODES.OUTPUT) {
    this.pinMode(pin, this.MODES.OUTPUT);
  }

  // this.analogWrite(pin, 0);

  // The sysfs port will have a 12-bit value of 0-4095,
  // the scale function will shift the value two bits to
  // right to produce a 10-bit value which matches Arduino
  // ADC read values.
  reporting[+gpio] = {
    alias: alias,
    event: event,
    index: pinIndex,
    path: "/sys/bus/iio/devices/iio:device0/in_voltage" + alias + "_raw",
    scale: function(raw) {
      return raw >>> 2;
    }
  };

  this.on(event, handler);

  return this;
};

Galileo.prototype.digitalRead = function(pin, handler) {
  var pinIndex = ToPinIndex(pin);
  var gpio = this.pins[pinIndex].gpio;
  var event = "digital-read-" + pin;

  if (this.pins[pinIndex].mode !== this.MODES.INPUT) {
    this.pinMode(pin, this.MODES.INPUT);
  }

  reporting[+gpio] = {
    event: event,
    index: pinIndex,
    path: this.pins[pinIndex].paths.value
  };

  this.on(event, handler);

  return this;
};

Galileo.prototype.analogWrite = function(pin, value) {
  var pinIndex = ToPinIndex(pin);

  if (this.pins[pinIndex].mode !== this.MODES.PWM) {
    this.pinMode(pin, this.MODES.PWM);
  }

  this.pins[pinIndex].write(value);

  return this;
};

Galileo.prototype.digitalWrite = function(pin, value) {
  var pinIndex = ToPinIndex(pin);

  if (this.pins[pinIndex].mode !== this.MODES.OUTPUT) {
    this.pinMode(pin, this.MODES.OUTPUT);
  }

  this.pins[pinIndex].write(value);

  return this;
};

Galileo.prototype.servoWrite = Galileo.prototype.analogWrite;

[
  "pulseIn",
  "pulseOut",
  "queryPinState",
  "sendI2CWriteRequest",
  "sendI2CReadRequest",
  "sendI2CConfig",
  "_sendOneWireRequest",
  "_sendOneWireSearch",
  "sendOneWireWriteAndRead",
  "sendOneWireDelay",
  "sendOneWireDelay",
  "sendOneWireReset",
  "sendOneWireRead",
  "sendOneWireSearch",
  "sendOneWireAlarmsSearch",
  "sendOneWireConfig",
  "stepperConfig",
  "stepperStep"
].forEach(function(method) {
  Galileo.prototype[method] = function() {
    throw method + " is not yet implemented.";
  };
});

module.exports = Galileo;

// http://wiki.ros.org/IntelGalileo/IntelGalileoPin

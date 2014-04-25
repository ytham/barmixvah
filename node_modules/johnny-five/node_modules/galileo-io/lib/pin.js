var es6 = require("es6-shim");
var Promise = require("es6-promise").Promise;
var remapped = require("remapped");
var fs = require("graceful-fs");
var Emitter = require("events").EventEmitter;
var tick = global.setImmediate || process.nextTick;

var priv = new Map();
var _ = null;

var EXPORT_PATH = "/sys/class/gpio/export";
var UNEXPORT_PATH = "/sys/class/gpio/export";
var PWM_EXPORT_PATH = "/sys/class/pwm/pwmchip0/export";
var PWM_UNEXPORT_PATH = "/sys/class/pwm/pwmchip0/unexport";

var mapping = {
  addr: "addr",
  supportedModes: "modes",
  analogChannel: "analogChannel"
};

var defaults = {
  analogChannel: null
};

function scale(x, fromLow, fromHigh, toLow, toHigh) {
  return (x - fromLow) * (toHigh - toLow) /
    (fromHigh - fromLow) + toLow;
}

function Mux(gpio, value) {
  priv.set(this, {
    value: 0,
    direction: null,
    drive: null,
    initial: {
      value: value,
      direction: "out",
      drive: "strong"
    }
  });

  this.paths = new Paths({
    id: gpio
  });

  this.gpio = gpio;
}

Mux.prototype.setup = function() {
  var state = priv.get(this);
  return new Promise(function(resolve) {
    if (state.initial !== null) {
      fs.open(this.paths.exported, "w", function(error, fd) {
        if (error && error.code === "ENOENT") {
          fs.writeFile(EXPORT_PATH, String(this.gpio));
        }

        // Order matters...
        ["drive", "direction", "value"].forEach(function(key) {
          this[key] = state.initial[key];
        }, this);

        // null the initial state data
        state.initial = null;
        resolve();
      }.bind(this));
    } else {
      resolve();
    }
  }.bind(this));
};

Object.defineProperties(
  Mux.prototype,
  [
    "value",
    "direction",
    "drive"
  ].reduce(function(descriptors, property) {
    descriptors[property] = {
      get: function() {
        return priv.get(this)[property];
      },
      set: function(value) {
        var state = priv.get(this);
        if (state[property] !== value) {
          priv.get(this)[property] = value;
          fs.writeFile(this.paths[property], String(value));
        }
      }
    };
    return descriptors;
  }, {})
);

function PWM(gpio) {
  // Conversion Reference
  //
  // 1ms = 1000μs
  // 1000μs = 1000000ns
  //
  // 2400000ns = 2400μs
  // 2400000ns = 2400μs
  // 600000ns  = 600μs
  priv.set(this, {
    enable: 0,
    period: 0,
    duty_cycle: 0
  });

  this.paths = new Paths({
    type: "pwm",
    id: gpio
  });

  this.gpio = gpio;
}

var MIN_PULSE = 600;
var MAX_PULSE = 2400;

function ToPulseWidth(eightbit) {
  return scale(eightbit, 0, 255, MIN_PULSE, MAX_PULSE) | 0;
}

function ToDutyCycle(eightbit) {
  return (((eightbit / 255) * 100) | 0) * 10000;
}

PWM.prototype.setup = function() {
  var state = priv.get(this);

  return new Promise(function(resolve) {
    fs.open(this.paths.exported, "r", function(error, fd) {
      if (error && error.code === "ENOENT") {
        fs.writeFile(PWM_EXPORT_PATH, String(this.gpio));
      }
      resolve();
    }.bind(this));
  }.bind(this));
};

PWM.prototype.write = function(value) {
  var state = priv.get(this);
  var duty = ToDutyCycle(value);

  if (state.enable === 0) {
    this.enable = 1;

    tick(this.write.bind(this, value));
    return this;
  }

  if (state.period === 0) {
    this.period = 2400000;

    tick(this.write.bind(this, value));
    return this;
  }

  // this.enable = 1;
  // this.period = 2400000;
  this.duty_cycle = ToDutyCycle(value);

  return this;
};

Object.defineProperties(
  PWM.prototype,
  [
    "enable",
    "period",
    "duty_cycle"
  ].reduce(function(descriptors, property) {
    descriptors[property] = {
      get: function() {
        return priv.get(this)[property];
      },
      set: function(value) {
        var state = priv.get(this);
        if (state[property] !== value) {
          priv.get(this)[property] = value;
          fs.writeFile(this.paths[property], String(value));
        }
      }
    };
    return descriptors;
  }, {})
);

function Paths(opts) {
  /**
   * opts.id number
   * opts.isAnalog true|false
   * opts.type: gpio (gpio, mux) | pwm
   */

  var type = typeof opts.type === "undefined" ?
    "gpio" : opts.type;

  var isAnalog = typeof opts.isAnalog === "undefined" ?
    false : opts.isAnalog;

  var id = opts.id;

  /*
    type = gpio | mux

    {
      exported: "/sys/class/gpio/gpio{id}/",
      drive: "/sys/class/gpio/gpio{id}/drive",
      direction: "/sys/class/gpio/gpio{id}/direction",
      value: "/sys/class/gpio/gpio{id}/value"
    }
  */
  if (type === "gpio" || type === "mux") {
    this.exported = "/sys/class/gpio/gpio" + id + "/";

    this.drive = isAnalog ? null :
      this.exported + "drive";

    this.direction = isAnalog ? null :
      this.exported + "direction";

    this.value = isAnalog ?
      "/sys/bus/iio/devices/iio:device0/in_voltage" + id + "_raw" :
      this.exported + "value";
  }
  /*
    type = pwm

    {
      exported: "/sys/class/pwm/pwmchip0/pwm{id}/",
      enable: "/sys/class/pwm/pwmchip0/pwm{id}/enable",
      period: "/sys/class/pwm/pwmchip0/pwm{id}/period",
      duty_cycle: "/sys/class/pwm/pwmchip0/pwm{id}/duty_cycle"
    }
  */
  if (type === "pwm") {
    this.exported = "/sys/class/pwm/pwmchip0/pwm" + id + "/";
    this.enable = this.exported + "enable";
    this.period = this.exported + "period";
    this.duty_cycle = this.exported + "duty_cycle";
  }
}

var digital = {
  pins: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
  ],
  gpio: [
  // 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13
    50, 51, 32, 18, 28, 17, 24, 27, 26, 19, 16, 25, 38, 39
  ],
  alias: {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8,
    9: 9, 10: 10, 11: 11, 12: 12, 13: 13
  },
  mux: [
    {
      gpio: [
    //   0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13
    //  50, 51, 32, 18, 28, 17, 24, 27, 26, 19, 16, 25, 38, 39
        40, 41, 31, 30,  _,  _,  _,  _,  _,  _, 42, 43, 54, 55
      ],
      value: [
        1,  1,  1,  1,  _,  _,  _,  _,  _,  _,  1,  1,  1,  1
      ]
    },
    {
      gpio: [
        _, _, 1, _, _, _, _, _, _, _, _, _, _, _
      ],
      value: [
        1, 1, 1, _, _, _, _, _, _, _, 1, 1, 1, 1
      ]
    }
  ]
};

var pwm = {
  pins: [
    3, 5, 6, 9, 10, 11
  ],
  alias: {
    3: 3, 5: 5, 6: 6, 9: 1, 10: 7, 11: 4
  }
};

var analog = {
  pins: [
    "A0", "A1", "A2", "A3", "A4", "A5"
  ],
  gpio: [
    44, 45, 46, 47, 48, 49
  ],
  alias: {
    "A0": 0, "A1": 1, "A2": 2, "A3": 3, "A4": 4, "A5": 5
  },
  offset: {
    "A0": 14, "A1": 15, "A2": 16, "A3": 17, "A4": 18, "A5": 19
  },
  mux: [
    {
      gpio: [
        37, 36, 23, 22, 21, 20
      ],
      value: [
        0, 0, 0, 0, 0, 0
      ]
    },
    {
      gpio: [
        _, _, _, _, 29, 29
      ],
      value: [
        _, _, _, _, 1, 1
      ]
    }
  ]
};

var ports = [];
var indices = {};
var index = -1;

[digital, analog].forEach(function(type, i) {
  var isAnalog = false;

  if (i > 13) {
    isAnalog = true;
  }

  type.pins.forEach(function(pin, j) {
    var ppin = isAnalog ? null : pwm.alias[pin];
    var gpio = type.gpio[j];
    var alias = type.alias[pin];
    var mux = [];

    var p = {
      pin: pin,
      gpio: gpio,
      alias: alias,
      mux: null,
      pwm: null,
      paths: new Paths({
        id: isAnalog ? alias : gpio,
        isAnalog: isAnalog
      })
    };

    if (type.mux[0].gpio[j] !== null) {
      mux[0] = new Mux(type.mux[0].gpio[j], type.mux[0].value[j]);
    }

    if (type.mux[1].gpio[j] !== null) {
      mux[1] = new Mux(type.mux[1].gpio[j], type.mux[1].value[j]);
    }

    if (mux.length) {
      p.mux = mux;
    }

    if (ppin) {
      p.pwm = new PWM(ppin);
    }

    ports.push(p);
    indices[pin] = ++index;
  });
});

/*

  The above code will produce two items:

    - ports: an array of "port" data objects:

      Analog:
      {
        paths: {
          direction: "/sys/class/gpio/gpio44/direction",
          drive: "/sys/class/gpio/gpio44/drive",
          exported: "/sys/class/gpio/gpio44/",
          value: "/sys/class/gpio/gpio44/value"
        },
        pin: "A0",
        mux: [{
            paths: [Object],
            direction: "out",
            drive: "strong",
            value: 0,
            gpio: 37
          },
          [length]: 1
        ],
        alias: 0,
        pwm: null,
        gpio: 44
      }

      Digital (w/ mux, pwm):
      {
        pin: 3,
        alias: 3,
        gpio: 18,
        mux: [{
            direction: "out",
            value: 1,
            drive: "strong",
            gpio: 30,
            paths: [Object]
          }, {
            direction: "out",
            value: 1,
            drive: "strong",
            gpio: 0,
            paths: [Object]
          },
          [length]: 2
        ],
        paths: {
          direction: "/sys/class/gpio/gpio18/direction",
          value: "/sys/class/gpio/gpio18/value",
          drive: "/sys/class/gpio/gpio18/drive",
          exported: "/sys/class/gpio/gpio18/"
        },
        pwm: {
          duty_cycle: 0,
          gpio: 3,
          paths: {
            duty_cycle: "/sys/class/pwm/pwmchip0/pwm3/duty_cycle",
            exported: "/sys/class/pwm/pwmchip0/pwm3/",
            enable: "/sys/class/pwm/pwmchip0/pwm3/enable",
            period: "/sys/class/pwm/pwmchip0/pwm3/period"
          },
          enable: 1,
          period: 0
        }
      }

      Digital (w/o mux, pwm):
      {
        gpio: 28,
        alias: 4,
        mux: null,
        paths: {
          value: "/sys/class/gpio/gpio28/value",
          drive: "/sys/class/gpio/gpio28/drive",
          exported: "/sys/class/gpio/gpio28/",
          direction: "/sys/class/gpio/gpio28/direction"
        },
        pin: 4,
        pwm: null
      }

    - indices: an object whose keys are Arduino pins and values
                are the corresponding index in the "ports" array.

      eg.
      {
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        "10": 10,
        "11": 11,
        "12": 12,
        "13": 13,
        "A0": 14,
        "A1": 15,
        "A2": 16,
        "A3": 17,
        "A4": 18,
        "A5": 19
      }
*/


function write(file, value, callback) {
  fs.writeFile(file, value, callback);
}



function Pin(setup) {
  Emitter.call(this);

  var port = ports[indices[setup.addr]];
  var state = {};

  [remapped(setup, mapping, defaults), port].reduce(Object.assign, this);

  this.isAnalog = setup.addr[0] === "A";

  // Firmata compatibility properties and values
  this.report = 0;
  this.value = 0;
  this.mode = null;

  state = {
    isSetup: false,
    isPwm: false,
    direction: "out"
  };

  priv.set(this, state);

  this.setup();
}

Pin.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Pin
  },
  isPwm: {
    set: function(value) {
      priv.get(this).isPwm = value;

      // Shut down digital pin value reading
      fs.writeFile(this.paths.value, String("0"));
    },
    get: function() {
      return priv.get(this).isPwm;
    }
  },
  direction: {
    set: function(value) {
      // TODO: throw on invalid values.
      //
      var state = priv.get(this);

      if (state.direction === value) {
        return;
      }

      var isOuput = value === "out";
      var drive = isOuput ? "strong" : "pullup";
      var direction = isOuput ? "out" : "in";

      fs.writeFile(this.paths.drive, drive);
      fs.writeFile(this.paths.direction, direction);
    },
    get: function() {
      return priv.get(this).direction;
    }
  }
});

Pin.prototype.write = function(value) {
  var state = priv.get(this);

  this.direction = "out";

  if (state.isPwm) {

    // if (this.mux[0] && !this.mux[0].value) {
    //   this.mux[0].value = 0;
    //   this.write(value);
    //   return;
    // }

    // if (this.mux[1] && this.mux[1].value) {
    //   this.mux[1].value = 0;
    //   this.write(value);
    //   return;
    // }

    if (this.value === 0) {
      fs.writeFile(this.paths.value, "1");
    }

    this.pwm.write(value);
  } else {
    fs.writeFile(this.paths.value, String(value));
  }

  this.value = value;
};

Pin.prototype.setup = function(opts) {
  var state = priv.get(this);
  var awaiting = [];

  if (!state.isSetup) {

    // If this pin has corresponding MUX pins
    if (this.mux) {
      this.mux.forEach(function(mux) {
        awaiting.push(mux.setup());
      }, this);
    }

    // If this pin has a corresponding PWM channel
    if (this.pwm) {
      awaiting.push(this.pwm.setup());
    }

    // If this pin is a digital pin...
    if (this.pin === this.alias) {
      awaiting.push(
        new Promise(function(resolve) {
          fs.open(this.paths.exported, "w", function(error, fd) {
            if (error && error.code === "ENOENT") {
              fs.writeFile(EXPORT_PATH, String(this.gpio));
            }

            fs.writeFile(this.paths.drive, "strong");
            fs.writeFile(this.paths.direction, "out");
            fs.writeFile(this.paths.value, "0");

            resolve();

          }.bind(this));
        }.bind(this))
      );
    }

    Promise.all(awaiting).then(function() {
      state.isSetup = true;
      this.emit("ready");
    }.bind(this));
  }

  return this;
};

module.exports = Pin;

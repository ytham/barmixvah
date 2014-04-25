# Galileo-io

[![Build Status](https://travis-ci.org/rwaldron/galileo-io.png?branch=master)](https://travis-ci.org/rwaldron/galileo-io)

Galileo-io is a Firmata-compatibility IO class for writing node programs that run on and interact with the [Intel Galileo](https://www-ssl.intel.com/content/www/us/en/do-it-yourself/galileo-maker-quark-board.html).

### Getting Started

See Intel Galileo setup. Galileo-io scripts are run _on_ the Galileo board itself, via its "full Linux" installation.

### Installation

```
npm install galileo-io
```

### Usage

This module can be used an IO plugin for [Johnny-Five](https://github.com/rwaldron/johnny-five).

### Blink an Led

The "Hello World" of microcontroller programming:

```js
var Galileo = require("galileo-io");
var board = new Galileo();

board.on("ready", function() {
  var byte = 0;
  this.pinMode(9, this.MODES.OUTPUT);

  setInterval(function() {
    board.digitalWrite(9, (byte ^= 1));
  }, 500);
});
```

### Johnny-Five IO Plugin

Galileo-IO is the default [IO layer](https://github.com/rwaldron/johnny-five/wiki/IO-Plugins) for [Johnny-Five](https://github.com/rwaldron/johnny-five) programs that are run on an Intel Galileo board.


### API

**digitalWrite(pin, 1|0)**

> Sets the pin to 1 or 0, which either connects it to 5V (the maximum voltage of the system) or to GND (ground).

Example:
```js
// This will turn on the pin
board.digitalWrite(9, 1);
```



**analogWrite(pin, value)**

> Sets the pin to a value between 0 and 255, where 0 is the same as LOW and 255 is the same as HIGH. This is sort of like sending a voltage between 0 and 5V, but since this is a digital system, it uses a mechanism called Pulse Width Modulation, or PWM. You could use analogWrite to dim an LED, as an example.

Example:
```js
// Crank an LED to full brightness
board.analogWrite(9, 255);
```

**servoWrite(pin, value)** This is an alias to `analogWrite`


**digitalRead(pin, handler)** Setup a continuous read handler for specific digital pin.

> This will read the digital value of a pin, which can be read as either HIGH or LOW. If you were to connect the pin to 5V, it would read HIGH (1); if you connect it to GND, it would read LOW (0). Anywhere in between, it’ll probably read whichever one it’s closer to, but it gets dicey in the middle.

Example:
```js
// Log all the readings for 9
board.digitalRead(9, function(data) {
  console.log(data);
});
```


**analogRead(pin, handler)** Setup a continuous read handler for specific analog pin.

> This will read the analog value of a pin, which is a value from 0 to 4095, where 0 is LOW (GND) and 4095 is HIGH (5V). All of the analog pins (A0 to A5) can handle this. analogRead is great for reading data from sensors.


Example:
```js
// Log all the readings for A1
board.analogRead("A1", function(data) {
  console.log(data);
});

```

## License
See LICENSE file.


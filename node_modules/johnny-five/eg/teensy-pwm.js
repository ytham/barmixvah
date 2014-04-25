var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {

  var pwms = 34;

  // for (var i = 0; i <= pwms; i++ ) {
  //   console.log( "%d is PWM? %s", i, this.pins.isPwm(i) );
  // }

  console.log(this.pins);

  // console.log("9 : " + board.pins.isPwm(9));
  // console.log("19 : " + board.pins.isPwm(19));
  // console.log("20 : " + board.pins.isPwm(20));

  // // Create a standard led hardware instance
  // led = new five.Led(9);

  // board.repl.inject({
  // led: led
  // });

  // led.pulse();
  // });
});


/*
// Teensy 3.0
#elif defined(__MK20DX128__)
#define TOTAL_ANALOG_PINS       14
#define TOTAL_PINS              38 // 24 digital + 10 analog-digital + 4 analog
#define VERSION_BLINK_PIN       13
#define IS_PIN_DIGITAL(p)       ((p) >= 0 && (p) <= 34)
#define IS_PIN_ANALOG(p)        (((p) >= 14 && (p) <= 23) || ((p) >= 34 && (p) <= 38))
#define IS_PIN_PWM(p)           digitalPinHasPWM(p)
#define IS_PIN_SERVO(p)         ((p) >= 0 && (p) < MAX_SERVOS)
#define IS_PIN_I2C(p)           ((p) == 18 || (p) == 19)
#define PIN_TO_DIGITAL(p)       (p)
#define PIN_TO_ANALOG(p)        (((p)<=23)?(p)-14:(p)-24)
#define PIN_TO_PWM(p)           PIN_TO_DIGITAL(p)
#define PIN_TO_SERVO(p)         (p)

*/

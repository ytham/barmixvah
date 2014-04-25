var five = require("../lib/johnny-five.js");
var keypress = require("keypress");
// var dualShock = require("dualshock-controller");

var board = new five.Board();
// var controller = dualShock({
//   config: "dualShock3",
//   analogStickSmoothing: true
// });

// controller.isConnected = false;

board.on("ready", function() {

  var esc = new five.ESC(12);

  // Initialize the ESCs speed to 0
  esc.to(0);

  // Hold shift+arrow-up, shift+arrow-down to incrementally
  // increase or decrease speed.

  function controller(ch, key) {
    var isThrottle = false;
    var speed = esc.last ? esc.speed : 0;

    if (key && key.shift) {
      if (key.name === "up") {
        speed += 1;
        isThrottle = true;
      }

      if (key.name === "down") {
        speed -= 1;
        isThrottle = true;
      }

      if (isThrottle) {
        esc.to(speed);
      }
    } else {
      // A number...


    }
  }

  this.repl.inject({
    esc: esc
  });


  keypress(process.stdin);

  process.stdin.on("keypress", controller);
  process.stdin.setRawMode(true);
  process.stdin.resume();
});

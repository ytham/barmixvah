var five = require("../lib/johnny-five.js");

// console.log(Object.keys(five.Servo.prototype));

var board = new five.Board();

board.on("ready", function() {
  console.log(new five.Servo(11));

});

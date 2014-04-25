var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var gyro = new five.Gyroscope({
    pins: ["I0", "I1"],
    freq: 200,
    extent: 4
  });

  gyro.on("acceleration", function(err, data) {
    console.log(data.position);
  });
});

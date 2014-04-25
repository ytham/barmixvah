var five = require("../lib/johnny-five.js");
var temporal = require("temporal");
var board = new five.Board();

board.on("ready", function() {

  // Initialize two new objects that represent
  // the right and left servo
  var right = new five.Servo(10);
  var left = new five.Servo(11);

  // Immediately set the position of the servos
  // to their center point, which by defailt
  // is 90 degrees.
  right.center();
  left.center();

  // In this program's REPL (read-eval-print-loop)
  // inject a reference to each servo so that
  // we can control them manually while the
  // program is running.
  this.repl.inject({
    right: right,
    left: left
  });

  // In order to change the direction of the servo
  // and therefore the arm itself, we must track the
  // direction across each movement. To do this,
  // we'll say that our initial direction equals
  // 0 and the opposing direction equals 1.
  var direction = 0;

  // Using the temporal library's loop function,
  // create a loop that executes a function every 500
  // milliseconds. We choose 500 because that's how
  // long our servo movements will be.
  temporal.loop(500, function() {

    // If direction has a value that evaluates to
    // 'true' (eg. 1), then move the servo positions
    // to 90 degrees over 500 milliseconds
    if (direction) {
      left.to(90, 500);
      right.to(90, 500);
    } else {
      // Otherwise, move the servo positions to
      // 150 degrees over 500 milliseconds
      left.to(150, 500);
      right.to(150, 500);
    }

    // Update the direction to its opposite for the next
    // iteration of the loop.
    direction = direction === 0 ? 1 : 0;
  });
});

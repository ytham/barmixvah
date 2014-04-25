var five = require("../lib/johnny-five.js");
var SunCalc = require("suncalc");
var board = new five.Board();

board.on("ready", function() {
  var sun;
  // lat/lng for Brooklyn
  var lat = 40.6736;
  var lng = -73.9579;

  // Every 10 minutes, get the sun's position
  // and update the motors
  // 6e5
  this.loop(500, function() {
    sun = SunCalc.getPosition(new Date(), lat, lng);

    console.log(sun);
  });
});

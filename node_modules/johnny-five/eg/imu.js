// Run this program with a device model:
//
//    node eg/imu.js MPU6050
//
//    You may also use the model number printed on the
//    device itself. eg
//
//    GY-521
//
//    Without a specific model number, the readings will
//    be wrong (unless you've connected a GP2Y0A02YK0F/2Y0A02)
//
// Valid models:
//
// - MPU6050/GY-521
//     https://www.sparkfun.com/products/11028
//
//
var five = require("../lib/johnny-five.js"),
  board = new five.Board({
    port: "/dev/cu.usbmodem1411"
  }),
  device = process.argv[2] || "MPU6050";

board.on("ready", function() {
  var distance = new five.IMU({
    device: device,
    freq: 500
  });

  distance.on("data", function() {
    console.log(this);
  });
});

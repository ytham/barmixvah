var five = require('johnny-five');

var board, pump1, pump2, pump3, pump4, pump5;

board = new five.Board();
board.on('ready', function () {
  pump1 = new five.Led(6);
});

exports.pumpMilliseconds = function (pump, ms) {
  startPump(pump);
  setTimeout(function () {
    stopPump(pump);
  }, ms);
}

function startPump(pump) {
  pump.on();
}

function stopPump(pump) {
  pump.off();
}
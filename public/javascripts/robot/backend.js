var five = require('johnny-five');

var board, pump0, pump1, pump2, pump3, pump4;

board = new five.Board();
board.on('ready', function () {
  // Counting down pins because that's the orientation 
  // that my Arduino happens to be in
  pump0 = new five.Led(7);
  pump1 = new five.Led(6);
  pump2 = new five.Led(5);
  pump3 = new five.Led(4);
  pump4 = new five.Led(3);

  board.repl.inject({
    p0: pump0,
    p1: pump1,
    p2: pump2,
    p3: pump3,
    p4: pump4
  });
});

exports.pump = function (ingredients) {
  console.log("Dispensing Drink");
  for (var i in ingredients) {
    (function (i) {
      setTimeout(function () {  // Delay implemented to have a top-biased mix
        console.log(ingredients[i].pump);
        pumpMilliseconds(exports.usePump(ingredients[i].pump), ingredients[i].amount);
      }, ingredients[i].delay);
    })(i);
  }
};
/*
exports.startAllPumps = function () {
  exports.startPump("pump0");
  exports.startPump("pump1");
  exports.startPump("pump2");
  exports.startPump("pump3");
  exports.startPump("pump4");
}

exports.stopAllPumps = function () {
  exports.stopPump("pump0");
  exports.stopPump("pump1");
  exports.stopPump("pump2");
  exports.stopPump("pump3");
  exports.stopPump("pump4");
}
*/
function pumpMilliseconds(pump, ms) {
  exports.startPump(pump);
  setTimeout(function () {
    exports.stopPump(pump);
  }, ms);
}

exports.startPump = function (pump) {
  pump.on();
  console.log("Pump on");
}

exports.stopPump = function (pump) {
  pump.off();
  console.log("Pump off");
}

exports.usePump = function (pump) {
  var using;
  switch(pump) {
    case 'pump0':
      using = pump0;
      break;
    case 'pump1':
      using = pump1;
      break;
    case 'pump2':
      using = pump2;
      break;
    case 'pump3':
      using = pump3;
      break;
    case 'pump4':
      using = pump4;
      break;
    default:
      using = null;
      break;
  }
  return using;
}
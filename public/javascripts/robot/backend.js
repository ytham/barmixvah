var five = require('johnny-five');

var board, pump0, pump1, pump2, pump3, pump4;

board = new five.Board();
board.on('ready', function () {
  // Counting down because that's the orientation that my Arduino happens to be in
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
  console.log("Pump");
  console.log(ingredients);
  for (var i in ingredients) {
    console.log(ingredients[i].pump);
    pumpMilliseconds(usePump(ingredients[i].pump), ingredients[i].amount);
  }
};

exports.startAllPumps = function () {
  pump0.on();
  pump1.on();
  pump2.on();
  pump3.on();
  pump4.on();
}

exports.stopAllPumps = function () {
  pump0.off();
  pump1.off();
  pump2.off();
  pump3.off();
  pump4.off();
}

function pumpMilliseconds(pump, ms) {
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

function usePump(pump) {
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
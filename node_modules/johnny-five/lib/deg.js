function scale(x, fromLow, fromHigh, toLow, toHigh) {
  return (x - fromLow) * (toHigh - toLow) /
    (fromHigh - fromLow) + toLow;
}



function deg(x) {
  var fromLow = 600;
  var fromHigh = 2400;
  var toLow = 0;
  var toHigh = 180;

  if (x < 0) {
    fromLow *= -1;
    fromHigh *= -1;
    toHigh *= -1;
  }

  return scale(x, fromLow, fromHigh, toLow, toHigh);
}



[
  650, -650,
  600, 2400, -600, -2400

].forEach(function(val) {
  console.log(deg(val));
});

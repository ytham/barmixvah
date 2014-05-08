/* GET home page. */
exports.index = function (Drink, Pump) {
  return function (req, res) {
    Drink.find({}, function (err, drinks) {
      Pump.find({}, function (err, pumps) {
        res.render('index', { 
          title: "Bar Mixvah: The Automatic Bartender Robot" ,
          drinks: drinks,
          pumps: pumps
        });
      });
    });
  };
};

exports.updatePump = function (Pump) {
  console.log("Pump");
  console.log(Pump);
  return function (req, res) {
    console.log("req.body");
    console.log(req.body);
    Pump.remove(function (err) {
      console.log('Collection removed');
    });
    //Pump.findOneAndUpdate({}, req.body, function (err, pump) {
    Pump.create(req.body, function (err, pump) {
      console.log(pump);
      console.log('====');
      console.log(err);
      // if (pump == null) {
      //   console.log('this ran');
      //   var m = Pump.create(req.body);
      //   console.log(m);
      // }
      res.send(pump);
    });
  }
}

// exports.updateAllPumps = function (Pump) {
//   return function (req, res) {
//     console.log(req.body);
//     var pumps = req.body;
//     for (var i = 0; i < pumps.length; i++) {
//       Pump.findOneAndUpdate({ label: req.body.label });
//     }
//   }
// }
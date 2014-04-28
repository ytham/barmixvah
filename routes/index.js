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
  return function (req, res) {
    console.log(req.body);
    Pump.findOneAndUpdate({ label: req.body.label }, { ingredient: req.body.ingredient }, function (err, pump) {
      console.log(pump);
      res.send(pump);
    });
  }
}
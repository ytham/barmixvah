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
    Pump.findOneAndUpdate({ _id: req.body._id }, 
      {
        ingredients: req.body.ingredients
      },
      function (err, pump) {
        console.log(pump);
        console.log('====');
        console.log(err);
        console.log('request body');
        console.log(req.body);
        if (pump == null) {
          Pump.create(req.body);
          pump = req.body;
          console.log('pump eq null');
        }
        res.send(pump);
    });
  }
}
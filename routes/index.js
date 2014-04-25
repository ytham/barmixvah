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

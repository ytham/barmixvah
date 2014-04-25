/* GET home page. */
exports.index = function (Drink, Pump) {
  return function (req, res) {
    Drink.find({}, function (err, drinks) {
      Pump.find({}, function (err, pumps) {
        res.render('index', { 
          title: "B'Artagnan: The Automatic Bar Robot" ,
          drinks: drinks,
          pumps: pumps
        });
      }
    });
  };
};

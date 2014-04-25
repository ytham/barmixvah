/* GET add drink page. */
exports.form = function (req, res) {
  res.render('add');
}

exports.addDrink = function (Drink) {
  return function (req, res) {
    console.log(req.body);
    var drink = new Drink(req.body);
    drink.save(function (err, drink) {
      if (err || !drink) {
        res.json({ error: err });
      } else {
        res.json({ drink: drink });
      }
    });
  };
};

exports.logDrink = function (Drink) {
  return function (req, res) {
    console.log(req.body);
  };
};
/* GET add drink page. */
// Show the add form
exports.form = function (Drink) {
  return function (req, res) {
    Drink.find({}, function (err, drinks) {
      res.render('add', {
        title: 'Add Drink',
        drinks: drinks
      });
    });
  };
}

// Add a drink
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

// Log the drink to console
exports.logDrink = function (Drink) {
  return function (req, res) {
    console.log(req.body);
  };
};

// Add a pump
exports.addPump = function (Pump) {
  return function (req, res) {
    console.log(req.body);
    var pump = new Pump(req.body);
    pump.save(function (err, pump) {
      if (err || !pump) {
        res.json({ error: err });
      } else {
        res.json({ pump: pump });
      }
    });
  };
};;
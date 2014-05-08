/* GET edit page */
exports.show = function (Drink) {
  return function (req, res) {
    Drink.find({}, function (err, drinks) {
      res.render('edit', { 
        title: "Bar Mixvah: Edit Drinks" ,
        drinks: drinks,
      });
    });
  };
};

exports.updateDrink = function (Drink) {
  return function (req, res) {
    Drink.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, drink) {
      if (drink) {
        console.log("Update Drink");

        res.send(drink);
      }
    });
  };
};
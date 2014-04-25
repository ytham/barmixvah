var Mongoose = require('mongoose');

exports.DrinkSchema = new Mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: false },
  ingredients: [{
    name: String,
    amount: Number
  }]
});
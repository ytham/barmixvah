var Mongoose = require('mongoose');

// exports.PumpSchema = new Mongoose.Schema({
//   label: { type: String, unique: true, sparse: true, required: true },
//   ingredient: { type: String, required: false },
// });

exports.PumpSchema = new Mongoose.Schema({
  label: { type: String, unique: true, sparse: true, required: true },
  ingredients: [
    { 
      label: String, 
      ingredient: String
    }
  ]
});
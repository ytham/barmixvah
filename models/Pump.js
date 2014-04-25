var Mongoose = require('mongoose');

exports.PumpSchema = new Mongoose.Schema({
  pump: { type: String, unique: true, required: true },
  ingredient: { type: String, required: false },
});
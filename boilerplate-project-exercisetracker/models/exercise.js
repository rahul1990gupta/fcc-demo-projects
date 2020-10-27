const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");

exerciseSchema = mongoose.Schema({
    userId: String,
    description: String,
    duration: Number,
    date: String
});

module.exports = mongoose.model('exercise', exerciseSchema);
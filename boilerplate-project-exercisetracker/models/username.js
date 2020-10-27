const mongoose = require("mongoose");

usernameSchema = mongoose.Schema({
    username: String
});

const Username = mongoose.model('username', usernameSchema)
module.exports = Username;
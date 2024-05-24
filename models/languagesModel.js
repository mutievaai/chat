const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Languages", languageSchema);

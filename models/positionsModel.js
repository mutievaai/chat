const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Positions", positionSchema);

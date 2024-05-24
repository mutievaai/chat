const mongoose = require("mongoose");

const instrumentSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Instruments", instrumentSchema);

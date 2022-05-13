const { Int32 } = require("mongodb");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
  },
  arrivalTimestamp:{
    type: Number,
  },
  departureTimestamp:{
    type: Number,
  },
  arrivalDateTimestamp: {
    type: Date,
  },
  arrivalTime: {
    type: Number,
  },
  departureDateTimestamp: {
    type: Date,
  },
  departureTime: {
    type: Number,
  },
  terminal: {
    type: String,
  },
});

module.exports = mongoose.model("Airport", schema);
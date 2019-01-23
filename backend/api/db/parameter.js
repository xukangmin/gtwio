// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const ParameterSchema = new Schema(
  {
    ParameterID: String,
    AddTimeStamp: Number,
    DisplayName: String,
    CurrentValue: Number,
    Unit: String,
    Type: String,
    Equation: String
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Parameter", ParameterSchema, "parameters");

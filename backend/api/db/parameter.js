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
    CurrentTimeStamp: Number,
    Unit: String,
    Type: String,
    Tag: String,
    Equation: String,
    RequiredBy: [String], // ParameterID List
    Require: [String], // ParameterID List
    RawData: [Object]
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Parameter", ParameterSchema, "parameters");

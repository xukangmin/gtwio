// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CalculationHistorySchema = new Schema(
  {
    ResolvedEquation: String, 
    TimeStamp: Number, 
    Result: Number
  }, 
  {_id: false}
);

// this will be our data base's data structure
const ParameterSchema = new Schema(
  {
    ParameterID: {type: String, index: true, unique: true},
    DisplayName: String,
    Alias: String,
    CurrentValue: Number,
    CurrentTimeStamp: Number,
    Channel: String,
    Unit: String,
    Type: String,
    Tag: {type: String, index: true},
    Equation: String,
    ActiveEquation: String,
    OriginalEquation: String,
    RequiredBy: [String], // ParameterID List
    Require: [String], // ParameterID List
    Status: String,
    StatusCode: Number,
    StabilityCriteria: {WindowSize: Number, UpperLimit: Number},
    Range: {UpperLimit: Number, LowerLimit: Number},
    StandardDeviation: Number,
    StreamingStatus: String,
    Timeout: Number, // in seconds
    Baseline: Number, // epoch timestamp miliseconds
    DataAvailableTimeRange: [Number], // only store hourly data
    CalculationHistory: [CalculationHistorySchema] // only store recent 20 calculation
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Parameter", ParameterSchema, "parameters");

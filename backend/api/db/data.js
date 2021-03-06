// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DataSchema = new Schema(
  {
    ParameterID: String,
    TimeStamp: Number, // with ms accuracy
    Value: Number,
    Valid: Boolean // criteria defined in the parameters
  }
);

DataSchema.index({ParameterID: 1, TimeStamp: 1}, { unique: true});


// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Data", DataSchema, "data");

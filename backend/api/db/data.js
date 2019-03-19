// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DataSchema = new Schema(
  {
    ParameterID: {type: String, index: true},
    TimeStamp: {type: Number, index: true}, // with ms accuracy
    Value: Number,
    Valid: Boolean // criteria defined in the parameters
  }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Data", DataSchema, "data");

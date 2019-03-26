// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const AlertSchema = new Schema(
  {
    AlertID: {type: String, index: true, unique: true},
    AlertType: String,
    DeviceID: String,
    ParameterID: String,
    AssetID: String,
    Message: String
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Alert", AlertSchema, "alerts");

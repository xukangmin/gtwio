// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const AssetSchema = new Schema(
  {
    AssetID: String,
    AddTimeStamp: Number,
    AssetType: String,
    Devices: [{DeviceID: String}],
    DisplayName: String,
    LatestTimeStamp: Number,
    Variables: [{VariableID: String}]
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Asset", AssetSchema, "assets");

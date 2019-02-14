// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const AssetSchema = new Schema(
  {
    AssetID: String,
    AddTimeStamp: Number,
    AssetType: String,
    DisplayName: String,
    LatestTimeStamp: Number,
    Parameters: [{ParameterID: String}],
    Devices: [{DeviceID: String}],
    Dashboards: [{DashboardID: String}],
    Settings: {Tags: [{TagName: String, Data: [{Name: String, ParameterID: String}]}]}
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Asset", AssetSchema, "assets");

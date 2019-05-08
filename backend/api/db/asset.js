// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const AssetSchema = new Schema(
  {
    AssetID: {type: String, index: true, unique: true},
    AssetType: String,
    DisplayName: String,
    Location: String,
    LatestTimeStamp: Number,
    Parameters: [{ParameterID: String}],
    Devices: [{DeviceID: String}],
    Dashboards: [{DashboardID: String}],
    Config : Object,
    Settings: {
      Tags: [
        {
          TagName: String, 
          Data: 
            [
              { 
                Name: String, 
                AssignedTag: String,
                ParameterList: [{Tag: String, ParameterID: String, Active: Number}]
              }
            ]
        }
      ],
      Baselines: [
        {
          TimeStamp: Number,
          Active: Number
        }
      ]
    }
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Asset", AssetSchema, "assets");

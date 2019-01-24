// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DeviceSchema = new Schema(
  {
    DeviceID: String,
    AddTimeStamp: Number,
    DisplayName: String,
    SerialNumber: String,
    MetaInfo: Object,
    Tag: String,
    Parameters: [{ParameterID: String}]
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Device", DeviceSchema, "devices");

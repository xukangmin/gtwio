// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DeviceSchema = new Schema(
  {
    DeviceID: {type: String, index: true, unique: true},
    DisplayName: String,
    SensorID: String,
    SerialNumber: {type: String, index: true},
    MetaInfo: Object,
    Tag: String,
    Angle: Number,
    Type: String,
    LastCalibrationDate: Date,
    Parameters: [{ParameterID: String}]
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Device", DeviceSchema, "devices");

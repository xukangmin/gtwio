// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const AlertSchema = new Schema(
  {
    AlertID: {type: String, index: true, unique: true},
    AlertType: String,
    ParameterID: String,
    ActiveMinutes: Number, // minutes
    Trigger: String,
    Message: String,
    Action: String,
    Emails: String,
    SMS: String,
    WebHooks: String,
    OnOff: Number
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Alert", AlertSchema, "alerts");

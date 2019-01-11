// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const UserSchema = new Schema(
  {
    UserID: String,
    Active: Number,
    ApiKey: String,
    Created: Number,
    EmailAddress: String,
    Password: String,
    VerificationCode: String,
    VerificationCodeExpire: Number,
    Assets: [{AssetID : String}]
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("User", UserSchema, "users");

// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DashboardSchema = new Schema(
  {
    DashboardID: String,
    AddTimeStamp: Number,
    DisplayName: String,
    Widgets: [{
      WidgetID: String,
      Title: String,
      Layoutdata: {x: Number, y: Number, w: Number, h: Number},
      Type: String,
      DataSource: {
        ParameterID: String,
        Type: String,
        StartTimeStamp: Number,
        EndTimeStamp: Number,
        Interval: Number
      }
    }]
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Dashboard", DashboardSchema, "dashboards");

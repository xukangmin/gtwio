//'use strict';

var shareUtil = require('./shareUtil.js');
const Dashboard = require('../db/dashboard.js');
const Asset = require('../db/assetManage.js');

var functions = {
  createDashboard: createDashboard,
  updateDashboard: updateDashboard,
  deleteDashboard: deleteDashboard,
  getDashboardByAsset: getDashboardByAsset,
  getSingleDashboard: getSingleDashboard,
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function createDashboard(req, res) {
  var dashboardobj = req.body;
  console.log(req.body);
  //var displayName = dashboardobj.DisplayName;
  var assetid = dashboardobj.AssetID;
  if (assetid) {
    const shortid = require('shortid');


    let dashboard = new Dashboard();

    dashboard.DashboardID = "S" + shortid.generate();
    dashboard.AddTimeStamp = Math.floor((new Date).getTime() / 1000);

    if (dashboardobj.DisplayName)
    {
      dashboard.DisplayName = dashboardobj.DisplayName;
    }

    if (dashboardobj.Widgets)
    {
      dashboard.Widgets = dashboardobj.Widgets;
    }

    dashboard.save(err => {
      if (err)
      {
        var msg = "dashboard Save Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
      }
      else {
        // add Dashboard to asset
        Asset.findOneAndUpdate({AssetID: assetid},
            {
              $push:  {
                Dashboards: {DashboardID: dashboard.DashboardID}
              }
            },
          function(err, data) {
          if (err)
          {
            var msg = "Dashboard update Error:" + JSON.stringify(err, null, 2);
            shareUtil.SendInternalErr(res,msg);
          }
          else {
            shareUtil.SendSuccess(res);
          }
        });
      }
    });

  } else {
    var msg = "AssetID Name missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}


function updateDashboard(req, res) {
  var dashboardobj = req.body;
  var isValid = true;
  if (dashboardobj.constructor === Object && Object.keys(dashboardobj).length === 0) {
    shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    if (!dashboardobj.DashboardID) {
      shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
    } else {
      Dashboard.findOneAndUpdate({DashboardID: dashboardobj.DashboardID}, dashboardobj, function(err, data)
      {
        if (err)
        {
          var msg = "Error device:" +  JSON.stringify(err, null, 2);
          console.error(msg);
          shareUtil.SendInternalErr(res, msg);
        } else {
            shareUtil.SendSuccess(res);
        }
      });
    }
  }
}

function deleteDashboard(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var dashboardid = req.swagger.params.DashboardID.value;

  if (assetid) {
    if (dashboardid) {
      // remove in user table and asset
      Dashboard.deleteOne({DashboardID: dashboardid}, function(err) {
        if (err)
        {
          var msg = "Error:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res);
        }
        else{
          Asset.findOneAndUpdate({AssetID: assetid}, {
            $pull: {
              DashboardID: {DashboardID: dashboardid}
            }
          }, function(err, data){
            if (err)
            {
              var msg = "Error:" + JSON.stringify(err, null, 2);
              shareUtil.SendInternalErr(res);
            } else {
                shareUtil.SendSuccess(res);
            }
          });

        }
      });
    } else {
      var msg = "dashboardid missing";
      shareUtil.SendInvalidInput(res, msg);
    }
  } else {
    var msg = "AssetID missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function getDashboardByAsset(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  Asset.findOne({AssetID: assetid}, function(err, data)
  {
    if (err) {
      var msg = "Error: " + JSON.stringify(err, null, 2);
      callback(false, msg);
    }
    else {
      if (data)
      {
        var dashboardslist = data.Dashboards;
        getSingleDashboardInternal(0, dashboardslist, [], function(dashboardout){
          shareUtil.SendSuccessWithData(res, dashboardout);
        });
      } else {
        var msg = "AssetID does not exist";
        shareUtil.SendNotFound(res, data);
      }
    }
  });
}


function getSingleDashboardInternal(index, dashboards, dashboardout, callback) {
  if (index < dashboards.length) {
    if (index == 0) {
      dashboardout = [];
    }
    Dashboard.findOne({DashboardID: dashboards[index].DashboardID},function(err,data){
      if (!err) {
        dashboardout.push(data);
      }
      getSingleDashboardInternal(index + 1, dashboards, dashboardout, callback);
    });
  } else {
    callback(dashboardout);
  }
}

function getSingleDashboard(req, res) {
  var dashboardid = req.swagger.params.DashboardID.value;
  Dashboard.findOne({DashboardID: dashboardid}, function(err, data) {
    if (err) {
      var msg =  "Error:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res,msg);
    } else {
      shareUtil.SendSuccessWithData(res, data);
    }
  });
}

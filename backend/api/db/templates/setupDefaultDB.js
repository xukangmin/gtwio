const User = require('../user.js');
const Asset = require('../asset.js');
const Parameter = require('../parameter.js');
const Device = require('../device.js');
const Dashboard = require('../dashboard.js');
const Data = require('../data.js');

var userid = 'USERID0';

var assetid = 'ASSETID0';

var dashboardid = 'DASHBOARDID0';

function createUser(userid) {
  var epochtime = Math.floor((new Date).getTime()/1000);
  var uuidv1 = require('uuid/v1');
  var crypto = require('crypto');
  let user = new User();

  user.EmailAddress = 'demo@gtwlabs.com';
  user.Password = 'demo';
  user.UserID =  userid;
  user.Created = epochtime;
  user.VerificationCodeExpire = epochtime + 1800; // expire in 30 minutes
  user.VerificationCode = crypto.randomBytes(20).toString('hex');
  user.ApiKey = crypto.randomBytes(16).toString('hex');
  user.Active = 1;

  user.save(null);
}

function deleteUser(userid) {
  User.deleteMany({UserID: userid}, function(err) {
  });
}

function deleteAsset(assetid) {
  Asset.deleteMany({AssetID: assetid}, function(err) {
  });
}

function deleteDashboard(dashboardid) {
  Dashboard.deleteMany({DashboardID: dashboardid}, function(err) {
  });
}

function deleteTempSensors() {

  var i;

  for (i = 0; i < 16; i++) {
    Device.deleteMany({DeviceID: 'Temp' + i.toString()}, function(err){
    });
    Parameter.deleteMany({ParameterID: 'TempPara' + i.toString()}, function(err){
    });
    Data.deleteMany({ParameterID: 'TempPara' + i.toString()}, function(err){
    });
  }

}


function createAsset(userid, assetid) {
  let asset = new Asset();

  asset.AssetID = assetid;
  asset.LatestTimeStamp = 0;
  asset.DeviceCount = 0;
  asset.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
  asset.DisplayName = 'demo_hx_asset';

  asset.save(err => {
    if (err)
    {
      var msg = "Asset Save Error:" + JSON.stringify(err, null, 2);
      console.log(msg);
    }
    else {
      // add asset to user
      User.findOneAndUpdate({UserID: userid},
          {
            $push:  {
              Assets: {AssetID: asset.AssetID}
            }
          },
        function(err, data) {
        if (err)
        {
          var msg = "User update Error:" + JSON.stringify(err, null, 2);
          console.log(msg);
        }
      });

    }

  });

}

function createDashboard(assetid) {
  let dashboard = new Dashboard();

  dashboard.DashboardID = dashboardid;
  dashboard.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
  dashboard.DisplayName = 'Dashboard DEMO';
  dashboard.Widgets = [
                        {
                          Layoutdata: {w: 8, h: 8, x: 0, y: 0},
                          Title: 'Heat Extranger',
                          Type: 'hx'
                        }
                      ];

  dashboard.save(err => {
    if (err)
    {
      var msg = "dashboard Save Error:" + JSON.stringify(err, null, 2);
      console.log(msg);
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
          console.log(msg);
        }
      });
    }
  });
}

function createTempSensor(assetid, index, tagName, sn, angle) {

    let device = new Device();

    device.DeviceID = 'Temp' + index.toString();
    device.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
    device.DisplayName = 'Temperature Sensor ' + index.toString();
    device.Tag = tagName;
    device.SerialNumber = sn;
    device.Angle = angle;
    device.LastCalibrationDate = (new Date).getTime();
    device.CalibrationConstants = {A: 0, B: 1, C: 0};
    device.CorrectionEquation = 'A * A * data + B * data + C';

    device.save(err => {
      if (err)
      {
        var msg = "device Save Error:" + JSON.stringify(err, null, 2);
        console.log(msg);
      }
      else {
        // add device to asset
        Asset.findOneAndUpdate({AssetID: assetid},
            {
              $push:  {
                Devices: {DeviceID: device.DeviceID}
              }
            },
          function(err, data) {
          if (err)
          {
            var msg = "Device update Error:" + JSON.stringify(err, null, 2);
            console.log(msg);
          }
          else{
            let para = new Parameter();

            para.ParameterID = 'TempPara' + index.toString();
            para.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
            para.DisplayName = 'Temperature Value';
            para.CurrentValue = 0;
            para.Type = 'Temperature';
            para.Unit = 'F';
            para.Tag = tagName + "/" + para.Type; // automatically generated if under device

            para.save(err => {
              if(err)
              {
                var msg = "para add Error:" + JSON.stringify(err, null, 2);
                console.log(msg);
              }
              else {
                Device.findOneAndUpdate({DeviceID: 'Temp' + index.toString()},
                {
                  $push: {
                    Parameters: {ParameterID: para.ParameterID}
                  }
                },
                function(err, data) {
                  if (err) {
                    var msg = "para add to device Error:" + JSON.stringify(err, null, 2);
                    console.log(msg);
                  }
                }

                );
              }
            });
          }
        });

      }

    });
}

function createDemoAccount() {
  createUser(userid);
  createAsset(userid, assetid);
  createDashboard(assetid);
  createTempSensor(assetid, 0, "ShellInlet", "02A001", 0);
  createTempSensor(assetid, 1, "ShellInlet", "02A002", 90);
  createTempSensor(assetid, 2, "ShellInlet", "02A003", 180);
  createTempSensor(assetid, 3, "ShellInlet", "02A004", 270);
  createTempSensor(assetid, 4, "ShellOutlet", "02A005", 0);
  createTempSensor(assetid, 5, "ShellOutlet", "02A006", 90);
  createTempSensor(assetid, 6, "ShellOutlet", "02A007", 180);
  createTempSensor(assetid, 7, "ShellOutlet", "02A008", 270);
  createTempSensor(assetid, 8, "TubeInlet", "02A009", 0);
  createTempSensor(assetid, 9, "TubeInlet", "02A010", 90);
  createTempSensor(assetid, 10, "TubeInlet", "02A011", 180);
  createTempSensor(assetid, 11, "TubeInlet", "02A012", 270);
  createTempSensor(assetid, 12, "TubeOutlet", "02A013", 0);
  createTempSensor(assetid, 13, "TubeOutlet", "02A014", 90);
  createTempSensor(assetid, 14, "TubeOutlet", "02A015", 180);
  createTempSensor(assetid, 15, "TubeOutlet", "02A016", 270);
  //createTempSensor(assetid,0,3,'ShellInlet');
  //createTempSensor(assetid,4,7,'ShellOutlet');
  //createTempSensor(assetid,8,11,'TubeInlet');
  //createTempSensor(assetid,12,15,'TubeOutlet');
}

function deleteDemoAccount() {
  deleteUser(userid);
  deleteAsset(assetid);
  deleteTempSensors();
  deleteDashboard(dashboardid);
}

function checkDemoExist(callback) {
  User.findOne({UserID: userid}, function(err, data) {
    if (err) {
      callback(false);
    } else {
      if (data)
      {
        callback(true);
      } else {
        callback(false);
      }
    }
  });

}

module.exports.createDemoAccount = createDemoAccount;
module.exports.checkDemoExist = checkDemoExist;
module.exports.deleteDemoAccount = deleteDemoAccount;

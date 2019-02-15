const User = require('../api/db/user.js');
const Asset = require('../api/db/asset.js');
const Parameter = require('../api/db/parameter.js');
const Device = require('../api/db/device.js');
const Dashboard = require('../api/db/dashboard.js');
const Data = require('../api/db/data.js');
const API_PORT =  require('../config/constants.js').API_PORT;
const fetch = require('node-fetch');

var userid = 'USERID0';

var assetid = 'ASSETID0';

var dashboardid = 'DASHBOARDID0';

function createUser(userid) {
  return new Promise(
    (resolve, reject) => {
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

      user.save(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }
  );
}

function createAsset(userid, assetid) {
  return new Promise(
    (resolve, reject) => {
      let asset = new Asset();

      asset.AssetID = assetid;
      asset.LatestTimeStamp = 0;
      asset.DeviceCount = 0;
      asset.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
      asset.DisplayName = 'demo_hx_asset';

      var settings = {};
      settings.Tags = [
              {
                TagName: "ShellInlet",
                Data: [
                  {
                    Name: "Temperature",
                    ParameterID: "GenPara0"
                  },
                  {
                    Name: "FlowRate",
                    ParameterID: "FlowPara0"
                  }]
              },
              {
                TagName: "ShellOutlet",
                Data: [
                  {
                    Name: "Temperature",
                    ParameterID: "GenPara1"
                  },
                  {
                    Name: "FlowRate",
                    ParameterID: "FlowPara1"
                  }]
              },
              {
                TagName: "TubeInlet",
                Data: [
                  {
                    Name: "Temperature",
                    ParameterID: "GenPara2"
                  },
                  {
                    Name: "FlowRate",
                    ParameterID: "N/A"
                  }]
              },
              {
                TagName: "TubeOutlet",
                Data: [
                  {
                    Name: "Temperature",
                    ParameterID: "GenPara3"
                  },
                  {
                    Name: "FlowRate",
                    ParameterID: "FlowPara1"
                  }]
              },
            ];
      asset.Settings = settings;
      asset.save(err => {
        if (err)
        {
          var msg = "Asset Save Error:" + JSON.stringify(err, null, 2);
          console.log(msg);
          reject(err);
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
              reject(err);
            } else {
              resolve();
            }
          });

        }

      });
    }
  );


}

function createDashboard(assetid) {
  return new Promise(
    (resolve, reject) => {
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
          reject(err);
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
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    }
  );

}

function createFlowMeter(assetid, index, tagName, sn, angle) {
    return new Promise(
      (resolve, reject) => {
        let device = new Device();

        device.DeviceID = 'Flow' + index.toString();
        device.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
        device.DisplayName = 'Flow Meter ' + index.toString();
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
            reject(err);
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
                reject(err);
              }
              else{
                let para = new Parameter();

                para.ParameterID = 'FlowPara' + index.toString();
                para.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
                para.DisplayName = 'Flow Value';
                para.CurrentValue = 0;
                para.CurrentTimeStamp = 0;
                para.Type = 'FlowRate';
                para.Unit = 'gpm';
                para.Tag = tagName + "/" + para.Type; // automatically generated if under device
                para.StabilityCriteria = {WindowSize: 300, UpperLimit: 1};
                para.Range = {UpperLimit: 100, LowerLimit: 32};

                para.save(err => {
                  if(err)
                  {
                    var msg = "para add Error:" + JSON.stringify(err, null, 2);
                    console.log(msg);
                    reject(err);
                  }
                  else {
                    Device.findOneAndUpdate({DeviceID: 'Flow' + index.toString()},
                    {
                      $push: {
                        Parameters: {ParameterID: para.ParameterID}
                      }
                    },
                    function(err, data) {
                      if (err) {
                        var msg = "para add to device Error:" + JSON.stringify(err, null, 2);
                        console.log(msg);
                        reject(err);
                      } else {
                        resolve();
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
    );

}

function createTempSensor(assetid, index, tagName, sn, angle) {
    return new Promise(
      (resolve, reject) => {
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
            reject(err);
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
                reject(err);
              }
              else{
                let para = new Parameter();

                para.ParameterID = 'TempPara' + index.toString();
                para.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
                para.DisplayName = 'Temperature Value';
                para.CurrentValue = 0;
                para.CurrentTimeStamp = 0;
                para.Type = 'Temperature';
                para.Unit = 'F';
                para.Tag = tagName + "/" + para.Type; // automatically generated if under device
                para.StabilityCriteria = {WindowSize: 300, UpperLimit: 1};
                para.Range = {UpperLimit: 100, LowerLimit: 32};

                para.save(err => {
                  if(err)
                  {
                    var msg = "para add Error:" + JSON.stringify(err, null, 2);
                    console.log(msg);
                    reject(err);
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
                        reject(err);
                      } else {
                        resolve();
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
    );

}

function createParameter(assetid, index, displayName, tag, equation) {
  return new Promise(
     (resolve, reject) => {
       let para = new Parameter();

       para.ParameterID = 'GenPara' + index.toString();
       para.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
       para.DisplayName = displayName;
       para.Tag = tag;
       para.Equation = equation;
       para.Unit = "F";
       para.save(err => {
         if (err)
         {
           var msg = "Parameters Save Error:" + JSON.stringify(err, null, 2);
           console.log(msg);
           reject(err);
         } else {
           Asset.findOneAndUpdate({AssetID: assetid},
               {
                 $push:  {
                   Parameters: {ParameterID: para.ParameterID}
                 }
               }, function(err) {
                   if (err) {
                     var msg = "Parameters Save Error:" + JSON.stringify(err, null, 2);
                     console.log(msg);
                     reject(err);
                   } else {
                     resolve();
                   }
               });
         }
       });
     }
  );
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

  for (i = 0; i < 4; i++) {
    Parameter.deleteMany({ParameterID: 'GenPara' + i.toString()}, function() {});
  }

}

function updateRequireListByEquation(paraid) {
  return new Promise(
    (resolve, reject) => {
      const requestOptions = {
          headers: { 'Content-Type': 'application/json'},
          method: 'PUT',
          body: JSON.stringify({
              'ParameterID': paraid
          })
      };

      fetch('http://localhost:' + API_PORT + '/parameter/updateRequireListByEquation', requestOptions)
          .then(response => {
              return Promise.all([response, response.json()])
          })
          .then( ([resRaw, resJSON]) => {
              if (!resRaw.ok)
              {
                  return reject(resJSON.message);
              }
              return resJSON;
          })
          .then(user => {
              console.log(user);
              resolve();
          });
    }
  );

}



function createDemoAccount() {
  createUser(userid)
    .then(
      ret => {
        return createAsset(userid, assetid);
      }
    )
    .then(
      ret => {
        return createDashboard(assetid);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 0, "ShellInlet", "02A001", 0);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 1, "ShellInlet", "02A002", 90);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 2, "ShellInlet", "02A003", 180);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 3, "ShellInlet", "02A004", 270);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 4, "ShellOutlet", "02A005", 0);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 5, "ShellOutlet", "02A006", 90);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 6, "ShellOutlet", "02A007", 180);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 7, "ShellOutlet", "02A008", 270);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 8, "TubeInlet", "02A009", 0);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 9, "TubeInlet", "02A010", 90);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 10, "TubeInlet", "02A011", 180);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 11, "TubeInlet", "02A012", 270);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 12, "TubeOutlet", "02A013", 0);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 13, "TubeOutlet", "02A014", 90);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 14, "TubeOutlet", "02A015", 180);
      }
    )
    .then(
      ret => {
        return createTempSensor(assetid, 15, "TubeOutlet", "02A016", 270);
      }
    )
    .then(
      ret => {
        return createFlowMeter(assetid, 0, "ShellInlet", "05A001", 0);
      }
    )
    .then(
      ret => {
        return createFlowMeter(assetid, 1, "TubeOutlet", "05A002", 0);
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 0, 'Average Shell Inlet', 'AVG_SHELL_INLET', 'Avg([TempPara0,LAST,0,0],[TempPara1],[TempPara2],[TempPara3])');
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 1, 'Average Shell Outlet', 'AVG_SHELL_OUTLET', 'Avg([TempPara4],[TempPara5],[TempPara6],[TempPara7])');
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 2, 'Average Tube Inlet', 'AVG_TUBE_INLET', 'Avg([TempPara8],[TempPara9],[TempPara10],[TempPara11])');
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 3, 'Average Tube Outlet', 'AVG_TUBE_OUTLET', 'Avg([TempPara12],[TempPara13],[TempPara14],[TempPara15])');
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 4, 'Delta T S', 'DELTA_TS', '[GenPara0] - [GenPara1]');
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 5, 'Delta T 1', 'DELTA_T1', '[GenPara2] - [GenPara1]');
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 6, 'Delta T 2', 'DELTA_T2', '[GenPara3] - [GenPara0]');
      }
    )
    .then(
      ret => {
        return createParameter('ASSETID0', 7, 'LMTD', 'LMTD', '([GenPara5] - [GenPara6])/log([GenPara5]/[GenPara6])');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara0');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara1');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara2');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara3');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara4');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara5');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara6');
      }
    )
    .then(
      ret => {
        return updateRequireListByEquation('GenPara7');
      }
    )
    .catch(
      err => {
        console.log(err);
      }
    )
  //addRequireToParameter('GenPara0', ['TempPara0','TempPara1','TempPara2','TempPara3']);
  //addRequireToParameter('GenPara0', ['TempPara0','TempPara1','TempPara2','TempPara3']);
  //addRequireToParameter('GenPara0', ['TempPara0','TempPara1','TempPara2','TempPara3']);
  //addRequireToParameter('GenPara0', ['TempPara0','TempPara1','TempPara2','TempPara3']);

  //createTempSensor(assetid,0,3,'ShellInlet');
  //createTempSensor(assetid,4,7,'ShellOutlet');
  //createTempSensor(assetid,8,11,'TubeInlet');
  //createTempSensor(assetid,12,15,'TubeOutlet');
}

function testFunc(username, password) {
  const requestOptions = {
      headers: { 'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify({
          'EmailAddress': username,
          'Password': password
      })
  };

  fetch('http://localhost:' + API_PORT + '/user/createUser', requestOptions)
      .then(response => {
          return Promise.all([response, response.json()])
      })
      .then( ([resRaw, resJSON]) => {
          if (!resRaw.ok)
          {
              return Promise.reject(resJSON.message);
          }
          return resJSON;
      })
      .then(user => {
          console.log(user);
      });
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
module.exports.testFunc = testFunc;

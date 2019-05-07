var userManage = require('./userManage.js');
var shareUtil = require('./shareUtil.js');
var deviceManage = require('./deviceManage.js');
var parameterManage = require('./parameterManage.js');
var dataManage = require('./dataManage.js');
const User = require('../db/user.js');
const Asset = require('../db/asset.js');

var functions = {
  getAssetByUser: getAssetByUser,
  getSingleAsset: getSingleAsset,
  createAsset: createAsset,
  updateAsset: updateAsset,
  deleteAsset: deleteAsset,
  createAssetByConfig: createAssetByConfig,
  createAssetByConfigFile: createAssetByConfigFile,
  createAllEquationWithInterval: createAllEquationWithInterval,
  deleteAllEquationWithInterval: deleteAllEquationWithInterval,
  getConfigByAssetID: getConfigByAssetID,
  getAllConfigByUserID: getAllConfigByUserID,
  getBaselineByAssetID: getBaselineByAssetID,
  addBaselineByAssetID: addBaselineByAssetID,
  deleteBaselineByAssetID: deleteBaselineByAssetID,
  setBaselineActive: setBaselineActive,
  updateBaseline: updateBaseline,
  getAssetTimeRange: getAssetTimeRange
};

for (var key in functions) {
  module.exports[key] = functions[key];
}

function _remove_duplicates(arr) {
  var new_arr = [];

  var exists;
  for(var i in arr) {
    exists = false;
    for(var j in new_arr) {
      if (arr[i].TimeStamp === new_arr[j].TimeStamp) {
        exists = true;
      }
    }
    if (!exists) {
      new_arr.push(arr[i]);
    }
  }

  return new_arr;
}

function _updateBaseLineforSingleParameter(baseline, ParameterID) {
  return new Promise(
    (resolve, reject) => {
      
    });
}



function updateBaseline(req, res) {
  var baseline_body = req.body;

  if (baseline_body.AssetID)
  {
    if (baseline_body.Baselines)
    {
      var active_baseline = baseline_body.Baselines.filter(item => item.Active === 1);

      if (active_baseline.length === 1)
      {
        Asset.findOne({AssetID: baseline_body.AssetID}, function(err, data) {
          if (err) {
            var msg = "updateBaseline:" + JSON.stringify(err, null, 2);
            shareUtil.SendInternalErr(res,msg);
          } else {
            if (data) {
               if (typeof data.Settings === 'undefined') {
                  data.Settings = {};
               }
  
               baseline_body.Baselines = _remove_duplicates(baseline_body.Baselines);
  
               data.Settings.Baselines = baseline_body.Baselines;
  
               data.save();
               
               console.log(active_baseline);

               parameterManage._updateBaselineforAllParameters(baseline_body.AssetID, active_baseline[0].TimeStamp);

               shareUtil.SendSuccess(res);
            } else {
              shareUtil.SendInternalErr(res,'Asset Not found');
            }
          }
        });
      } else {
        shareUtil.SendInvalidInput(res, 'Must have one active baseline');
      }

    } else {
      shareUtil.SendInvalidInput(res, 'Baseline not found');
    }
  } else {
    shareUtil.SendInvalidInput(res, 'assetid not found');
  }
}

function _getBaselineByAssetID(assetid) {
  return new Promise(
    (resolve, reject) => {
      Asset.findOne({AssetID: assetid}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          if (data) {
            if (data.Settings)
            {
              if (data.Settings.Baselines) {
                resolve(data.Settings.Baselines);
              } else {
                resolve([]);
              }
            } else 
            {
              resolve([]);
            }
          } else {
            resolve([]);
          }
          
        }
      });
    });
}

function getAssetTimeRange(req, res) {
  var assetID = req.swagger.params.AssetID.value;
  if (assetID) {
    var timerange = [];
    dataManage._getAllParameterByAssetID(assetID)
      .then(
        ret => {
          if (ret.length > 0) 
          {
            
            for(var i in ret) {
              if (ret[i].DataAvailableTimeRange)
              {
                var daobj = ret[i].DataAvailableTimeRange.toObject();
                if (daobj.length > 0)
                {
                  for (var j in daobj) {
                    if (timerange.includes(daobj[j]) === false)
                    {
                      timerange.push(daobj[j]);
                    }
                  }
                }

              }
            }

            shareUtil.SendSuccessWithData(res, timerange);

          } else {
            shareUtil.SendSuccessWithData(res, []);
          }
        }
      )
  } else {
    shareUtil.SendInvalidInput(res, 'assetid not found');
  }
}

function getBaselineByAssetID(req, res) {
  var assetID = req.swagger.params.AssetID.value;
  if (assetID) {
    _getBaselineByAssetID(assetID)
      .then(
        ret => {
          shareUtil.SendSuccessWithData(res, ret);
        }
      )
      .catch(
        err => {
          var msg = "getBaselineByAssetID:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
      );
  } else {
    shareUtil.SendInvalidInput(res, 'assetid not found');
  }
}

function _addBaselineByAssetID(baseline_body) {
  return new Promise(
    (resolve, reject) => {
      Asset.findOneAndUpdate({AssetID: baseline_body.AssetID}, 
        {
          $addToSet:  {
            "Settings.Baselines": {TimeStamp: baseline_body.TimeStamp, Active: 0}
          }
        }, function(err, data){
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
}



function addBaselineByAssetID(req, res) { 
  var baseline_body = req.body;

  if (baseline_body.AssetID)
  {
    _getBaselineByAssetID(baseline_body.AssetID)
      .then(
        ret => {
          // check if exists
          var exists = false;
          for(var i in ret) {
            if (ret[i].TimeStamp == baseline_body.TimeStamp) {
              exists = true;
            }
          }
          
          if (!exists) {
            return _addBaselineByAssetID(baseline_body);
          } else {
            return "exists";
          }
        }
      )
      .then(
        ret => {
          shareUtil.SendSuccess(res);
        }
      )
      .catch(
        err => {
          var msg = "addBaselineByAssetID:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
      )

  } else {
    shareUtil.SendInvalidInput(res, 'assetid not found');
  }

  
  
}

function _deleteBaselineByAssetID(baseline_body) {
  return new Promise(
    (resolve, reject) => {
      Asset.findOneAndUpdate({AssetID: baseline_body.AssetID}, {
        $pull: {
          "Settings.Baselines": {TimeStamp: baseline_body.TimeStamp}
        }
      }, function(err, data){
        if (err)
        {
          reject(err);
        } else {
          resolve();
        }
      });
    });
}

function deleteBaselineByAssetID(req, res) { 
  var baseline_body = req.body;

  if (baseline_body.AssetID)
  {
    _getBaselineByAssetID(baseline_body.AssetID)
      .then(
        ret => {
          // check if exists
          var exists = false;
          for(var i in ret) {
            if (ret[i].TimeStamp == baseline_body.TimeStamp) {
              exists = true;
            }
          }
          
          if (!exists) {
            return "not exists"
          } else {
            return _deleteBaselineByAssetID(baseline_body);
          }
        }
      )
      .then(
        ret => {
          shareUtil.SendSuccess(res);
        }
      )
      .catch(
        err => {
          var msg = "deleteBaselineByAssetID:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
      )

  } else {
    shareUtil.SendInvalidInput(res, 'assetid not found');
  }
}

function _setBaselineActive(baseline_body) {
  return new Promise(
    (resolve, reject) => {
      console.log(baseline_body);
      Asset.findOne({AssetID: baseline_body.AssetID}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          if (data.Settings) {
            if (data.Settings.Baselines) {
              for(var i in data.Settings.Baselines) {
                if (data.Settings.Baselines[i].TimeStamp == baseline_body.TimeStamp)
                {
                  data.Settings.Baselines[i].Active = baseline_body.Active;
                  data.save();
                }
              }
              resolve();
            } else {
              reject(new Error('Not exist'));
            }
          } else {
            reject(new Error('Not exist'));
          }
        }
      });
    });
}

function setBaselineActive(req, res) {
  var baseline_body = req.body;

  if (baseline_body.AssetID)
  {
    _getBaselineByAssetID(baseline_body.AssetID)
      .then(
        ret => {
          // check if exists
          var exists = false;
          for(var i in ret) {
            if (ret[i].TimeStamp == baseline_body.TimeStamp) {
              exists = true;
            }
          }
          
          if (!exists) {
            return "not exists"
          } else {
            return _setBaselineActive(baseline_body);
          }
        }
      )
      .then(
        ret => {
          shareUtil.SendSuccess(res);
        }
      )
      .catch(
        err => {
          var msg = "deleteBaselineByAssetID:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
      )

  } else {
    shareUtil.SendInvalidInput(res, 'assetid not found');
  }
}


function getAllConfigByUserID(req, res) {
  var userid = req.swagger.params.UserID.value;
  if (userid) {
    _getAssetByUser(userid)
      .then(
        ret => {
          Promise.all(ret.map(item => _getConfigByAssetID(item.AssetID)))
            .then(
              ret => {
                shareUtil.SendSuccessWithData(res, ret);
              }
            )
            .catch(
              err => {
                var msg = "getConfigByAssetID Error:" + JSON.stringify(err, null, 2);
                shareUtil.SendInternalErr(res, msg);
              }
            )
        }
      )
  } else {
    shareUtil.SendInvalidInput(res, 'userid not found');
  }
  
}

function _getConfigByAssetID(assetID) {
  return new Promise(
    (resolve, reject) => {
      Asset.findOne({AssetID: assetID}, function(err, assetData) {
        if (err) {
          reject(err);
        } else {
          var config = {};
          config.AssetName = assetData.DisplayName;
  
          dataManage._getAllParameterByAssetIDPromise(assetID)
            .then(
              equations => {
                var eqs = [];
  
                for(var i in equations) {
                  var singleEquation = {};
                  if (equations[i].Tag) {
                    singleEquation.Tag = equations[i].Tag;
                  }
  
                  if (equations[i].DisplayName) {
                    singleEquation.Name = equations[i].DisplayName;
                  }
  
                  if (equations[i].OriginalEquation) {
                    singleEquation.Equation = equations[i].OriginalEquation;
                  }
                  eqs.push(singleEquation);
                }
  
                config.Equations = eqs;
                return deviceManage._getDeviceByAsset(assetID);
              }
            )
            .then(
              devices => {  
  
                var dv = [];
                for(var i in devices) {
                  var singleDevice = {};
                  var paras = [];
                  if (devices[i].SerialNumber) {
                    singleDevice.SerialNumber = devices[i].SerialNumber;
                  }
  
                  if (devices[i].Tag) {
                    singleDevice.Tag = devices[i].Tag;
                  }
  
                  if (devices[i].DisplayName) {
                    singleDevice.Name = devices[i].DisplayName;
                  }
  
                  if (devices[i].Alias) {
                    singleDevice.Alias = devices[i].Alias;
                  }
  
                  if (typeof devices[i].Angle == 'number') {
                    singleDevice.Angle = devices[i].Angle;
                  }
  
                  if (devices[i].Parameters) {
                    for(var j in devices[i].Parameters) {
                      paras.push(devices[i].Parameters[j].Type);
                    } 
                  }
                  singleDevice.Parameters = paras;
                  dv.push(singleDevice);
                }
                config.Devices = dv;
  
                var originaltags = assetData.Settings.Tags.toObject();
  
                var dashboardtags = [];
                for(var i in originaltags) {
                  var singleTag = {};
                  singleTag.TagName = originaltags[i].TagName;
                  var arrData = [];
                  for(var j in originaltags[i].Data) {
                    var singleData = {};
                    singleData.Name = originaltags[i].Data[j].Name;
                    singleData.AssignedTag = originaltags[i].Data[j].AssignedTag;
                    arrData.push(singleData);
                  }
                  singleTag.Data = arrData;
                  dashboardtags.push(singleTag);
                }
  
                config.Dashboard = dashboardtags;

                resolve(config);
              }
            )
            .catch(
              err => {
                reject(err);
              }
            );
          
        }
      });
    });
}


function getConfigByAssetID(req, res) {
  
  var assetID = req.swagger.params.AssetID.value;
  var config = {};
  if (assetID)
  {
    _getConfigByAssetID(assetID)
      .then(
        ret => {
          var configarr = [];
          configarr.push(ret);
          shareUtil.SendSuccessWithData(res, configarr);
        }
      )
      .catch(
        err => {
          var msg = "getConfigByAssetID Error:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
        }
      );
  } else {
    shareUtil.SendInvalidInput(res, 'Asset ID not found');
  }
  
}

function _getAssetByUser(userid) {
  return new Promise(
    (resolve, reject) => {
      User.findOne({UserID: userid}, function(err, data)
      {
        if (err) {
          reject(err);
        }
        else {
          if (data)
          {
            resolve(data.Assets);
          } else {
            reject(new Error('Not Found'));
          }
        }
      });
    });
}

function getAssetByUser(req, res) {
  var userid = req.swagger.params.userID.value;
  User.findOne({UserID: userid}, function(err, data)
  {
    if (err) {
      var msg = "Error: " + JSON.stringify(err, null, 2);
      callback(false, msg);
    }
    else {
      if (data)
      {
        var assetslist = data.Assets;
        getSingleAssetInternal(0, assetslist, [], function(assetout){
          shareUtil.SendSuccessWithData(res, assetout);
        });
      } else {
        shareUtil.SendNotFound(res, data);
      }
    }
  });
}



function getSingleAssetInternal(index, assets, assetout, callback) {
  if (index < assets.length) {
    if (index == 0) {
      assetout = [];
    }
    Asset.findOne({AssetID: assets[index].AssetID},function(err,data){
      if (!err) {
        assetout.push(data);
      }
      getSingleAssetInternal(index + 1, assets, assetout, callback);
    });
  } else {
    callback(assetout);
  }
}


function getSingleAsset(req, res) {
  var assetID = req.swagger.params.AssetID.value;
  Asset.findOne({AssetID: assetID}, function(err, data) {
    if (err) {
      var msg = "Unable to scan the assets table.(getAssets) Error JSON:" + JSON.stringify(err, null, 2);
      shareUtil.SendInternalErr(res,msg);
    } else {
      shareUtil.SendSuccessWithData(res, data);
    }
  });
}

function createAsset(req, res) {
  var assetobj = req.body;
  if (assetobj.constructor === Object && Object.keys(assetobj).length === 0) {
    shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    var displayName = assetobj.DisplayName;
    var userid = assetobj.UserID;

    if (displayName && userid) {
      _createAssetPromise(userid, assetobj)
        .then(
          ret => {
            shareUtil.SendSuccess(res);
          }
        )
        .catch(
          err => {
            shareUtil.SendInternalErr(res,"User update Error:" + JSON.stringify(err, null, 2));
          }
        )
    }
    else {
      var msg = "UserID or Display Name missing";
      shareUtil.SendInvalidInput(res, msg);
    }
  }
}

function _updateAsset(assetobj) {
  return new Promise(
    (resolve, reject) => {
      if (assetobj.AssetID) {
        Asset.findOneAndUpdate({AssetID: assetobj.AssetID}, assetobj, function(err, data){
          if (err) {
            reject(err);
          } else {
            resolve(assetobj.AssetID);
          }
        });
      } else {
        reject(new Error('No asset ID'));
      }
    });
}

// USE by website only
function updateAsset(req, res) {
  var assetobj = req.body;
  var isValid = true;
  if(assetobj.constructor === Object && Object.keys(assetobj).length === 0) {
    isValid  = false;
  } else {
    if (!assetobj.AssetID) {
      isValid  = false;
    } else {
      Asset.findOneAndUpdate({AssetID: assetobj.AssetID}, assetobj, function(err, data)
      {
        if (err)
        {
          var msg = "Unable to update the settings table.( POST /settings) Error JSON:" +  JSON.stringify(err, null, 2);
          console.error(msg);
          shareUtil.SendInternalErr(res, msg);
        } else {
            shareUtil.SendSuccess(res);
        }


      });
    }
    if (!isValid) {
      shareUtil.SendInvalidInput(res);
    }
  }
}



function deleteAsset(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var userid = req.swagger.params.UserID.value;
  if (assetid) {
    if (userid) {
      var devicelist = [];
      var paralist = [];
      
      dataManage._getAllDeviceByAssetID(assetid)
        .then(
          ret => {
            devicelist = devicelist.concat(ret);
            return dataManage._getAllParameterByAssetID(assetid);
          }
        )
        .then(
          ret1 => {
            paralist = paralist.concat(ret1);
            return Promise.all(paralist.map(dataManage._deleteAllData));
          }
        )
        .then(
          ret2 => {
            return Promise.all(paralist.map(parameterManage._deleteSingleParameter));
          }
        )
        .then(
          ret3 => {
            return Promise.all(devicelist.map(deviceManage._deleteSingleDevice));
          }
        )
        .then(
          ret4 => {
            // remove in user table and asset
            Asset.deleteOne({AssetID: assetid}, function(err) {
              if (err)
              {
                var msg = "Error:" + JSON.stringify(err, null, 2);
                shareUtil.SendInternalErr(res);
              }
              else{
                User.findOneAndUpdate({UserID: userid}, {
                  $pull: {
                    Assets: {AssetID: assetid}
                  }
                }, function(err, data){
                  if (err)
                  {
                    var msg = "Error:" + JSON.stringify(err, null, 2);
                    console.log(msg);
                    shareUtil.SendInternalErr(res);
                  } else {
                      shareUtil.SendSuccess(res);
                  }
                });

              }
            });
          }
        )
        .catch(
          err => {
            var msg = "Error:" + JSON.stringify(err, null, 2);
            shareUtil.SendInternalErr(res, msg);
          }
        )

    } else {
      var msg = "UserID missing";
      shareUtil.SendInvalidInput(res, msg);
    }
  } else {
    var msg = "AssetID missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function _createAssetPromise(userid, assetobj) {
  return new Promise(
    (resolve, reject) => {
      const shortid = require('shortid');

      let asset = new Asset();

      for (var key in assetobj) {
        asset[key] = assetobj[key];
      }

      asset.AssetID = "A" + shortid.generate();
      asset.LatestTimeStamp = 0;
      asset.DeviceCount = 0;

      if (!asset.DisplayName)
      {
        asset.DisplayName = "Default Asset";
      }

      console.log("start save asset");
      asset.save(err => {
        if (err)
        {
          var msg = "Asset Save Error:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res,msg);
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
              reject(err);
            }
            else {
              resolve(asset.AssetID);
            }
          });

        }

      });
    });
}


function createAllEquationWithInterval(req, res)
{
  var data_body = req.body;

  var assetid = data_body.AssetID;
  var singleAssetConfig = data_body.Config;
  var interval = data_body.Interval;

  const _createEquations = async (assetid, equations) =>
  {
      for (let i = 0; i < equations.length; i++) {
        // console.log("creating equation" + i + "," + JSON.stringify(equations[i],null,2));
        let ret1 = await parameterManage._createEquationWithInterval(assetid, equations[i], interval);
      }
      return assetid;
  };

  _createEquations(assetid, singleAssetConfig.Equations)
    .then(
      ret => {
        shareUtil.SendSuccess(res);
      }
    )
    .catch(
      err => {
        console.log(err);
        shareUtil.SendInternalErr(res, "Cannot create equation");
      }
    )
}

function deleteAllEquationWithInterval(req, res){

}


function _createSingleAsset(userid, singleAssetConfig) {
  return new Promise(
    (resolve, reject) => {
      // first create asset
        var assetid;
        _createAssetPromise(userid, {DisplayName: singleAssetConfig.AssetName})
          .then(
            ret => {
              // create device
              //var tasks = singleAssetConfig.Devices.map(item => deviceManage._createDeviceWithParameter(ret, item));
              //var p = Promise.resolve();
              assetid = ret;
              const _createDevices = async (assetid, devices) =>
              {
                  for (let i = 0; i < devices.length; i++) {
                    let ret1 = await deviceManage._createDeviceWithParameter(assetid, devices[i]);
                  }
                  return assetid;
              };

              return _createDevices(ret, singleAssetConfig.Devices);
            }
          )
          .then(
            ret => {
              console.log("create device done");

              const _createEquations = async (assetid, equations) =>
              {
                  for (let i = 0; i < equations.length; i++) {
                    // console.log("creating equation" + i + "," + JSON.stringify(equations[i],null,2));
                    let ret1 = await parameterManage._createEquation(assetid, equations[i]);
                  }
                  return assetid;
              };

              return _createEquations(ret, singleAssetConfig.Equations);
            }
          )
          .then(
            ret => {
              console.log("create equation done");

              return dataManage._getAllParameterByAssetID(ret);
            }
          )
          .then(
            paralist => {
              var assetobj = {};
              if (singleAssetConfig.Dashboard)
              {
                for(var i in singleAssetConfig.Dashboard) {
                  for(var j in singleAssetConfig.Dashboard[i].Data) {
                    if (singleAssetConfig.Dashboard[i].Data[j].AssignedTag) {
                      var filterlist = paralist.filter(item => item.Tag === singleAssetConfig.Dashboard[i].Data[j].AssignedTag);
                      if (filterlist.length > 0) {
                        singleAssetConfig.Dashboard[i].Data[j].ParameterID = filterlist[0].ParameterID;
                      } else {
                        singleAssetConfig.Dashboard[i].Data[j].ParameterID = 'N/A';
                      }
                    }
                  }
                }

                
                assetobj.AssetID = assetid;
                assetobj.Settings = {};
                assetobj.Settings.Tags = singleAssetConfig.Dashboard;
                return _updateAsset(assetobj);
              } else {
                return assetid;
              }
              
            }
          )
          .then(
            ret => {
              console.log("create equation done");
              resolve(ret);
            }
          )
          .catch(
            err => {
              reject(err);
            }
          )
    });
}
function createAssetByConfigFile(req, res) {
  var data  = req.files.configFile.buffer.toString('utf8');
  var userid = req.body.UserID;
  var config;
  try{
    config = JSON.parse(data);
  }
  catch(e) {
    shareUtil.SendInvalidInput(res, 'Invalid JSON FILE');
  }
  
  if (config && userid) {
   // console.log(config);
   // console.log(userid);
    
    const _createAllAssetInternal = async(userid, config) => {
      for(let i = 0; i < config.length; i++) {
       let ret = await _createSingleAsset(userid, config[i]);
      }
      return 'create asset done';
    }

    _createAllAssetInternal(userid, config)
      .then(
        ret => {
          //console.log(ret);
          shareUtil.SendSuccess(res);
        }
      )
      .catch(
        err => {
          console.error(err);
          shareUtil.SendInvalidInput(res, "Create Asset Error:" + JSON.stringify(err, null, 2));
        }
      );
  } else {
    shareUtil.SendInvalidInput(res, 'User ID or Json file missing');
  }

  
}


function createAssetByConfig(req, res) {
  var assetobj = req.body;
  if (assetobj.constructor === Object && Object.keys(assetobj).length === 0) {
    shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    var config = assetobj.Config;
    var userid = assetobj.UserID;
    
    if (config && userid) {

      const _createAllAssetInternal = async(userid, config) => {
        var assetids = [];

        for(let i = 0; i < config.length; i++) {
         let ret = await _createSingleAsset(userid, config[i]);
         assetids.push(ret);
        }

        return assetids;
      }

      _createAllAssetInternal(userid, config)
        .then(
          ret => {
            console.log('create asset done');
            console.log(ret);
            shareUtil.SendSuccessWithData(res, ret);
          }
        )
        .catch(
          err => {
            console.error(err);
            shareUtil.SendInvalidInput(res, "Create Asset Error:" + JSON.stringify(err, null, 2));
          }
        );

    }
    else {
      var msg = "UserID or config missing";
      shareUtil.SendInvalidInput(res, msg);
    }
  }
}

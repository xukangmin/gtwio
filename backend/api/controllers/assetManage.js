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
  getAllTimeInterval: getAllTimeInterval,
  getConfigByAssetID: getConfigByAssetID,
  getAllConfigByUserID: getAllConfigByUserID,
  getBaselineByAssetID: getBaselineByAssetID,
  addBaselineByAssetID: addBaselineByAssetID,
  deleteBaselineByAssetID: deleteBaselineByAssetID,
  setBaselineActive: setBaselineActive,
  updateBaseline: updateBaseline,
  getAssetTimeRange: getAssetTimeRange,
  _getAssetTimeRange: _getAssetTimeRange,
  setTimerIntervalActiveForTag: setTimerIntervalActiveForTag,
  getAssetConfig: getAssetConfig,
  _getAssetConfig: _getAssetConfig,
  updateAssetConfig: updateAssetConfig,
  _update_recalculation_progress: _update_recalculation_progress
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

function _getAssetTimeRange(assetID) {
  return new Promise(
    (resolve, reject) => {
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
  
              resolve(timerange);
  
            } else {
              resolve([]);
            }
          }
        )
        .catch(
          err => {
            reject(err);
          }
        )
    });
}

function getAssetTimeRange(req, res) {
  var assetID = req.swagger.params.AssetID.value;
  if (assetID) {
    _getAssetTimeRange(assetID)
      .then(
        ret => {
          shareUtil.SendSuccessWithData(res, ret);
        }
      )
      .catch(err => {
        shareUtil.SendInternalErr(res, JSON.stringify(err, null , 2));
      });
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

function _getAsset(assetID) {
  return new Promise(
    (resolve, reject) => {
      Asset.findOne({AssetID: assetID}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
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

const _createEquations = async (assetid, equations, interval) =>
{
    for (let i = 0; i < equations.length; i++) {
      let ret1 = await parameterManage._createEquationWithInterval(assetid, equations[i], interval);
    }
    
    return assetid;
};


function createAllEquationWithInterval(req, res)
{
  var data_body = req.body;

  var assetid = data_body.AssetID;
  var interval = data_body.Interval;


  _getAsset(assetid)
    .then(
      ret => {
        var exists = false;
        if (ret.Config)
        {
          if (ret.Config.TimeInterval)
          {
            if (ret.Config.TimeInterval.includes(interval))
            {
              exists = true;
            }
          }
        }

        if (exists)
        {
          shareUtil.SendInvalidInput(res, "interval already exists");
        } else {
          if (ret.Config) {
            Asset.findOneAndUpdate({AssetID: assetid},               {
              $push:  {
                "Config.TimeInterval": interval
              }
            },function(err,data) {
              if (err) {
                shareUtil.SendInternalErr(res, "cannot push interval");
              } else {
                _createEquations(assetid, ret.Config.Equations, interval)
                .then(
                  ret => {
                    console.log("update_asset_display_tags");
                    _updateAssetDisplayTags(assetid)
                      .then(
                        ret => {
                          shareUtil.SendSuccess(res);
                        }
                      )
                      .catch(
                        err => {
                          shareUtil.SendInternalErr(res, JSON.stringify(err, null, 2));
                        }
                      );
                  }
                )
                .catch(
                  err => {
                    console.log(err);
                    shareUtil.SendInternalErr(res, "Cannot create equation");
                  }
                )
              }
            });
          } else {
            shareUtil.SendInvalidInput(res, "config not exist, try import config first");
          }

        }
      }
    )
    .catch(
      err => {
        shareUtil.SendInternalErr(res, JSON.stringify(err, null, 2));
      }
    )

  
  
}

function deleteAllEquationWithInterval(req, res){
  var assetid = req.body.AssetID;
  var interval = req.body.Interval;

  _getAsset(assetid)
  .then(
    ret => {
      var exists = false;
      if (ret.Config)
      {
        if (ret.Config.TimeInterval)
        {
          if (ret.Config.TimeInterval.includes(interval))
          {
            exists = true;
          }
        }
      }

      if (exists)
      {
        Asset.findOneAndUpdate({AssetID: assetid},{
          $pull:  {
            "Config.TimeInterval": interval
          }
        },function(err,data) {
          if (err) {
            shareUtil.SendInternalErr(res, "cannot pull interval");
          } else {
            dataManage._getAllParameterByAssetIDPromise(assetid)
              .then(
                paralist => {
                  var filtered_list = paralist.filter(item => parseInt(item.Tag.split(":")[1]) === parseInt(interval));

                  //console.log(filtered_list);
                  
                  //shareUtil.SendSuccessWithData(res, filtered_list);
                  Promise.all(filtered_list.map(item => parameterManage._removeParameter(assetid, null, item.ParameterID)))
                    .then(
                      ret => {
                        _updateAssetDisplayTags(assetid)
                          .then(
                            ret => {
                              shareUtil.SendSuccess(res);
                            }
                          )
                          .catch(
                            err => {
                              shareUtil.SendInternalErr(res, JSON.stringify(err, null, 2));
                            }
                          );
                      }
                    )
                    .catch(
                      err => {
                        shareUtil.SendInternalErr(res, JSON.stringify(err, null, 2));
                      }
                    )
                }
              )
              .catch(
                err => {
                  shareUtil.SendInternalErr(res, JSON.stringify(err,null,2));
                }
              );
          }
        });
      } else {
        shareUtil.SendInvalidInput(res, "interval not exists");
        
      }
    }
  )
  .catch(
    err => {
      shareUtil.SendInternalErr(res, JSON.stringify(err, null, 2));
    }
  );



  

}

function getAllTimeInterval(req, res) {
  var assetid = req.swagger.params.AssetID.value;

  _getAsset(assetid)
    .then(
      ret => {
        if (ret.Config) {
          if (ret.Config.TimeInterval)
          {
            shareUtil.SendSuccessWithData(res, ret.Config.TimeInterval);
          } else {
            shareUtil.SendSuccessWithData(res, []);
          }
        } else {
          shareUtil.SendSuccessWithData(res, []);
        }
      }
    )
    .catch(
      err => {
        shareUtil.SendInternalErr(res, JSON.stringify(err,null,2));
      }
    )

  // dataManage._getAllParameterByAssetIDPromise(assetid)
  //   .then(
  //     ret => {
  //       var timeinterval = [];
  //       for (var i in ret) {
  //         var ts = parseInt(ret[i].Tag.split(":")[1]);
  //         if (typeof ts != 'undefined' && isNaN(ts) === false) {
  //           if (timeinterval.includes(ts) === false)
  //           {
  //             timeinterval.push(ts);
  //           }
  //         }
  //       }

  //       shareUtil.SendSuccessWithData(res, timeinterval);
  //     }
  //   )
}

function setTimerIntervalActiveForTag(req, res) {
  var assetid = req.body.AssetID;
  var tagName = req.body.TagName;
  var equationName = req.body.AssignedTag;
  var interval = req.body.Interval;

  Asset.findOne({AssetID: assetid}, function(err,data){
    if (err) {
      shareUtil.SendInternalErr(res, JSON.stringify(err,null,2));
    } else {
      if (data.Settings.Tags) {
        var tags = data.Settings.Tags;
        for(var i in tags) {
          if (tags[i].TagName === tagName) {
            // console.log(tags[i]);
            
            for (var j in tags[i].Data) {
              if (tags[i].Data[j].AssignedTag === equationName) {
                for (var k in tags[i].Data[j].ParameterList) {
                  // console.log(tags[i].Data[j].ParameterList[k]);
                  // console.log(typeof tags[i].Data[j].ParameterList[k]);
                  if (tags[i].Data[j].ParameterList[k].Tag)
                  {
                    if (parseInt(tags[i].Data[j].ParameterList[k].Tag.split(":")[1]) === parseInt(interval))
                    {
                      tags[i].Data[j].ParameterList[k].Active = 1;
                    } else {
                      tags[i].Data[j].ParameterList[k].Active = 0;
                    }
                  }

                }
              }
            }
          }
        }
        data.save();
        shareUtil.SendSuccess(res);
      } else {
        shareUtil.SendInternalErr(res, "no tags found");
      }
    }
  });
}

function _updateAssetDisplayTags(assetid) {
  return new Promise(
    (resolve, reject) => {
      var singleAssetConfig;
      _getAsset(assetid)
        .then(
          ret => {
            singleAssetConfig = ret.Config;
            dataManage._getAllParameterByAssetID(assetid)
              .then(
                paralist => {
                  var assetobj = {};

                  for(var i in singleAssetConfig.DisplayTags) {
                    for(var j in singleAssetConfig.DisplayTags[i].Data) {
                      if (singleAssetConfig.DisplayTags[i].Data[j].AssignedTag) {
                        // var filterlist = paralist.filter(item => item.Tag.includes(singleAssetConfig.DisplayTags[i].Data[j].AssignedTag));
                        var filterlist = paralist.filter(item => item.Tag.split(":")[0] === singleAssetConfig.DisplayTags[i].Data[j].AssignedTag);
                        if (filterlist.length > 0) {
                          
                          singleAssetConfig.DisplayTags[i].Data[j].ParameterList = [];
                          for(var k in filterlist)
                          {
                            var active = 0;
                            if (k == 0)
                            {
                              active = 1;
                            }
                            singleAssetConfig.DisplayTags[i].Data[j].ParameterList.push({Tag: filterlist[k].Tag, ParameterID: filterlist[k].ParameterID, Active: active});
                          }
                        } else {
                          singleAssetConfig.DisplayTags[i].Data[j].ParameterList = [];
                        }
                        
                      }
                    }
                  }
    
                  
                  assetobj.AssetID = assetid;
                  assetobj.Settings = {};
                  assetobj.Settings.Tags = singleAssetConfig.DisplayTags;
                  _updateAsset(assetobj)
                    .then(ret => {
                      resolve();
                    })
                    .catch(err => {
                      reject(err);
                    })

                }
              )
              .catch(
                err => {
                  reject(err);
                }
              );
          }
        )
        .catch(
          err => {
            reject(err);
          }
        );
     
    });
}

function _createSingleAsset(userid, singleAssetConfig) {
  return new Promise(
    (resolve, reject) => {
      // first create asset
        var assetid;
        _createAssetPromise(userid, {DisplayName: singleAssetConfig.AssetName, Config: singleAssetConfig})
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
              console.log("create none interval equation done");

              const _createEquationsWithInterval = async (assetid, equations, intervals) =>
              {
                  for (let i = 0; i < intervals.length; i++)
                  {
                    for (let j = 0; j < equations.length; j++) {
                      // console.log("creating equation " + i + "," + JSON.stringify(equations[j],null,2) + ", interval=" + intervals[i]);
                      let ret1 = await parameterManage._createEquationWithInterval(assetid, equations[j], intervals[i]);
                    }
                  }

                  return assetid;
              };

              return _createEquationsWithInterval(ret, singleAssetConfig.Equations, singleAssetConfig.TimeInterval);
            }
          )
          .then(
            ret => {
              console.log("create interval equation done");

              return dataManage._getAllParameterByAssetID(ret);
            }
          )
          .then(
            paralist => {
              var assetobj = {};
              if (singleAssetConfig.DisplayTags)
              {
                for(var i in singleAssetConfig.DisplayTags) {
                  for(var j in singleAssetConfig.DisplayTags[i].Data) {
                    if (singleAssetConfig.DisplayTags[i].Data[j].AssignedTag) {
                      // var filterlist = paralist.filter(item => item.Tag.includes(singleAssetConfig.DisplayTags[i].Data[j].AssignedTag));
                      var filterlist = paralist.filter(item => item.Tag.split(":")[0] === singleAssetConfig.DisplayTags[i].Data[j].AssignedTag);
                      if (filterlist.length > 0) {
                        
                        singleAssetConfig.DisplayTags[i].Data[j].ParameterList = [];
                        for(var k in filterlist)
                        {
                          var active = 0;
                          if (k == 0)
                          {
                            active = 1;
                          }
                          singleAssetConfig.DisplayTags[i].Data[j].ParameterList.push({Tag: filterlist[k].Tag, ParameterID: filterlist[k].ParameterID, Active: active});
                        }
                      } else {
                        singleAssetConfig.DisplayTags[i].Data[j].ParameterList = [];
                      }
                      
                    }
                  }
                }

                
                assetobj.AssetID = assetid;
                assetobj.Settings = {};
                assetobj.Settings.Tags = singleAssetConfig.DisplayTags;
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
function _getAssetConfig(assetid) {
  return new Promise(
    (resolve, reject) => {
      Asset.findOne({AssetID: assetid},(err,data) => {
        if (err) {
          reject(err);
        } else {
          if (data) {
            resolve(data.Config);
          } else {
            reject("asset not found");
          }
        }
      });
    });
}

function getAssetConfig(req, res) {
  var assetid = req.swagger.params.AssetID.value;

  _getAssetConfig(assetid)
    .then(
      ret => {
        shareUtil.SendSuccessWithData(res, ret);
      }
    )
    .catch(
      err => {
        shareUtil.SendInternalErr(res, JSON.stringify(err, null, 2));
      }
    );
}

function _validate_config_file(config) {
  var shellintlet_num = config.Devices.filter(item => item.Tag === "ShellInlet").length;
  var shelloutlet_num = config.Devices.filter(item => item.Tag === "ShellOutlet").length;
  var tubeinlet_num = config.Devices.filter(item => item.Tag === "TubeInlet").length;
  var tubeoutlet_num = config.Devices.filter(item => item.Tag === "TubeOutlet").length;

  var ret = {};

  ret.isValid = true;
  ret.msg = "";

  if (shellintlet_num === 0)
  {
    ret.isValid = false;
    ret.msg = ret.msg + "No ShellInlet sensors ";
  }

  if (shelloutlet_num === 0)
  {
    ret.isValid = false;
    ret.msg = ret.msg + "No ShellOutlet sensors ";
  }

  if (tubeinlet_num === 0)
  {
    ret.isValid = false;
    ret.msg = ret.msg + "No TubeInlet sensors ";
  }

  
  if (tubeoutlet_num === 0)
  {
    ret.isValid = false;
    ret.msg = ret.msg + "No TubeOutlet sensors ";
  }

  return ret;
}

const _remove_device_async = async (assetid, devicelists) => {
  for(var i = 0; i < devicelists.length; i++) {
    var ret = await deviceManage._remove_device_from_asset_by_serialnumber(assetid, devicelists[i].SerialNumber);
  }

  return assetid;
}

const _add_device_async = async (assetid, devicelists) => {
  for(var i = 0; i < devicelists.length; i++) {
    var ret = await deviceManage._add_device_to_asset_gen(assetid, devicelists[i]);
  }

  return assetid;
}

function _reconfig_device(assetid, prev_config, config) {
  return new Promise(
    (resolve, reject) => {
      var device_dirty = false;

      if (!(JSON.stringify(prev_config.Devices) === JSON.stringify(config.Devices))) {
        device_dirty = true;
        console.log("device dirty");
      } 

      if (device_dirty) {
        // add and delete device
        var device_add_list = [];
        var device_delete_list = [];
        for(var i in prev_config.Devices)
        {
          var f_dev = config.Devices.filter(item => item.SerialNumber === prev_config.Devices[i].SerialNumber);

          if (f_dev.length === 0)
          {
            device_delete_list.push(prev_config.Devices[i]);
          }
        }

        for(var i in config.Devices) {
          var f_dev = prev_config.Devices.filter(item => item.SerialNumber === config.Devices[i].SerialNumber);

          if (f_dev.length === 0)
          {
            device_add_list.push(config.Devices[i]);
          }
        }

        _remove_device_async(assetid, device_delete_list)
        .then(
          ret => {
            return _add_device_async(assetid, device_add_list);
          }
        )
        .then(
          ret => {
            resolve();
          }
        )
        
      } else {
        resolve();
      }
  });

}

function _reconfig_equation(assetid, prev_config, config) {
  return new Promise(
    (resolve, reject) => {

      var para_dirty = false;


      if (!(JSON.stringify(prev_config.Equations) === JSON.stringify(config.Equations))) {
        para_dirty = true;
        console.log("Equations dirty");
      } 

      if (para_dirty) {
        dataManage._recalculateAsset(assetid, prev_config, config)
        .then(
          ret => {
            resolve(ret);
          }
        )
        .catch(
          err => {
            reject(err);
          }
        )
      } else {
        resolve();
      }
  });

}

function _rebuild_device() {
  
}

function _rebuild_equation() {

}

function _update_recalculation_progress(assetid, progress) {
  Asset.findOneAndUpdate({AssetID: assetid}, {RecalculationProgress: progress}, function(err, data) {
    if (err) {
      console.log(err);
    }
  });
}

function updateAssetConfig(req, res) {
  var assetid = req.body.AssetID;
  var config = req.body.Config;

  var ret = _validate_config_file(config)
  if (ret.isValid)
  {
    Asset.findOne({AssetID: assetid},(err,data) => {
      if (err) {
        shareUtil.SendInternalErr(res, JSON.stringify(err, null, 2));
      } else {
        if (data) {
          console.log("update asset");
          
          var prev_config = JSON.parse(JSON.stringify(data.Config));

          _reconfig_device(assetid, prev_config, config)
          .then(
            ret => {
              console.log("reconfigure device done");
              return _reconfig_equation(assetid, prev_config, config);
            }
          )
          .then(
            ret => {
              console.log("reconfigure equation done");
              data.Config = config;
              data.save();
              shareUtil.SendSuccessWithData(res, ret);
            }
          )
          .catch(
            err => {
              shareUtil.SendInternalErr(res, "cannot update config " + JSON.stringify(err, null, 2));
            }
          )


          // trigger recalculation
          // 1. delete all calculated data for assetid
          // 2. start recalculation
          
          // dataManage._recalculateAsset(assetid, prev_config, config);
          
        } else {
          shareUtil.SendInvalidInput(res, "asset not found");
        }
      }
    });
  }
  else {
    shareUtil.SendInvalidInput(res, ret.msg);
  }


}
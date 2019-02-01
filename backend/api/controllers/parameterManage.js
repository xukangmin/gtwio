//'use strict';

var shareUtil = require('./shareUtil.js');
const Data = require('../db/data.js');
const Device = require('../db/device.js');
const Parameter = require('../db/parameter.js');
const Asset = require('../db/asset.js');

// parameter is predefined like temperature, Humidity, heat transfer rate
// with equations depending on each other
// it can also handle unit conversions

var functions = {
  createParameter: createParameter,
  updateParameter: updateParameter,
  deleteParameter: deleteParameter,
  getParameterByAsset: getParameterByAsset,
  getParameterbyDevice: getParameterbyDevice,
  getSingleParameter: getSingleParameter,
  updateRequireList: updateRequireList
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function createParameter(req, res) {
  var paraobj = req.body;

  if (paraobj.AssetID) {
    _addParameter(paraobj.AssetID, null, paraobj, function(err) {
      if (err)
      {
        var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res, msg);
      } else {
          shareUtil.SendSuccess(res);
      }
    });
  } else if (paraobj.DeviceID) {
    _addParameter(null, paraobj.DeviceID, paraobj, function(err) {
      if (err)
      {
        var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
        console.error(msg);
        shareUtil.SendInternalErr(res, msg);
      } else {
          shareUtil.SendSuccess(res);
      }
    });
  }
  else {
    var msg = "AssetID or DeviceID or DataType or Unit missing";
    shareUtil.SendInvalidInput(res, msg);
  }

}

function updateParameter(req, res) {
  var paraobj = req.body;
  var isValid = true;
  if (paraobj.constructor === Object && Object.keys(paraobj).length === 0) {
    shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    if (!paraobj.ParameterID) {
      shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
    } else {
      Parameter.findOneAndUpdate({ParameterID: paraobj.ParameterID}, paraobj, function(err, data)
      {
        if (err)
        {
          var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
          console.error(msg);
          shareUtil.SendInternalErr(res, msg);
        } else {
            shareUtil.SendSuccess(res);
        }
      });
    }
  }
}

function deleteParameter(req, res) {
  var paraID = req.swagger.params.ParameterID.value;
  var assetID = req.swagger.params.AssetID.value;
  var deviceID = req.swagger.params.DeviceID.value;

 if (paraID && assetID) {
    // remove parameter in asset
    _removeParameter(assetID, null, paraID, function(err) {
      if (err) {
        shareUtil.SendInternalErr(res);
      } else {
        shareUtil.SendSuccess(res);
      }
    });
 } else if (paraID && deviceID) {
   _removeParameter(null, deviceID, paraID, function(err) {
     if (err) {
       shareUtil.SendInternalErr(res);
     } else {
       shareUtil.SendSuccess(res);
     }
   });
 } else {
   var msg = "parID or assetid or deviceid missing";
   shareUtil.SendInvalidInput(res, msg);
 }

}

function _removeParameter(assetID, deviceID, paraID, callback) {

  Parameter.deleteOne({ParameterID: paraID}, function(err) {
    if (err)
    {
      callback(err);
    }
    else{
      if (deviceID) {
        Device.findOneAndUpdate({DeviceID: deviceID},
            {
              $pull:  {
                Parameters: {ParameterID: paraID}
              }
            },
          function(err, data) {
            if (err)
            {
              callback(err);
            } else {
              callback(null);
            }
          });
      } else if (assetID) {
        Asset.findOneAndUpdate({AssetID: assetID},
            {
              $pull:  {
                Parameters: {ParameterID: paraID}
              }
            },
          function(err, data) {
            if (err)
            {
              callback(err);
            } else {
              callback(null);
            }
          });
      } else {
        callback('please input deviceID or assetID');
      }
    }
  });

}


function _addParameter(assetID, deviceID, paraobj, callback) {

  var uuidv1 = require('uuid/v1');
  var crypto = require('crypto');

  let para = new Parameter();

  para.ParameterID = uuidv1();
  para.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
  para.CurrentValue = 0;

  for (var key in paraobj) {
    para[key] = paraobj[key];
  }

  para.save(err0 => {
    if (err0)
    {
      callback(err0);
    }
    else {
      // add to devices
      if (deviceID) {
        Device.findOneAndUpdate({DeviceID: deviceID},
                    {
                      $push: {
                        Parameters:  {ParameterID: para.ParameterID}
                      }
                    },
                    function(err1,data) {
                      if (err1) {
                        callback(err1);
                      } else {
                        callback(null);
                      }
                    });
      } else if (assetID) { // add to asset only
          Asset.findOneAndUpdate({AssetID: assetID},
                    {
                        $push: {
                          Parameters:  {ParameterID: para.ParameterID}
                        }
                    },
                    function(err2,data){
                      if (err2)
                      {
                        callback(err2);
                      }
                      else {
                        callback(null);
                      }
                    }
                  );
      }




    }

  });
}

function getParameterByAsset(req, res) {

}

function getParameterbyDevice(req, res) {
}

function _add_single_parameter_require(paraid, ori_para_id){
  return new Promise(
    (resolve, reject) => {
      Parameter.findOne({ParameterID: paraid}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          if (!data.RequiredBy.includes(ori_para_id)) {
            // add paraid to required by list
            Parameter.update({ParameterID: paraid}, {
              $push: {
                RequiredBy: ori_para_id
              }
            },function(err, data){
              if (!err) {
                resolve();
              }
            });
          } else {
            resolve();
          }

        }
      });
    }
  );
}


function updateRequireList(req, res) {
  var paraID = req.body.ParameterID;
  var requireList = req.body.RequireList;

  if (paraID) {
    Parameter.findOne({ParameterID: paraID}, function(err,data) {
      if (err) {
        shareUtil.SendInternalErr(res);
      } else {
        data.Require = requireList;
        data.save(err => {
          if (err) {
            var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
            shareUtil.SendInternalErr(res, msg);
          } else {
            Promise.all(requireList.map(item => _add_single_parameter_require(item, paraID)))
              .then(
                ret => {
                  console.log("added");
                  shareUtil.SendSuccess(res);
                }
              )
              .catch(
                err => {
                  var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
                  shareUtil.SendInternalErr(res, msg);
                }
              )
          }
        });


      }
    });
  } else {
    var msg = "parID missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}
function removeFromRequireList(req, res) {

}

function getSingleParameter(req, res) {
  var paraID = req.swagger.params.ParameterID.value;

  if (paraID) {
    Parameter.findOne({ParameterID: paraID}, function(err,data) {
      if (err) {
        shareUtil.SendInternalErr(res);
      } else {
        shareUtil.SendSuccessWithData(res, data);
      }
    });
  } else {
    var msg = "parID missing";
    shareUtil.SendInvalidInput(res, msg);
  }

}

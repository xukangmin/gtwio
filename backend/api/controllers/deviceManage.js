//'use strict';

var shareUtil = require('./shareUtil.js');
var asset = require('./assetManage.js');
var userManage = require('./userManage.js');
const Device = require('../db/device.js');
const Asset = require('../db/asset.js');
const Data = require('../db/data.js');
const Parameter = require('../db/parameter.js');
const parameterManage = require('./parameterManage.js');
/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
var functions = {
  createDevice: createDevice,
  updateDevice: updateDevice,
  deleteDevice: deleteDevice,
  getDeviceByAsset: getDeviceByAsset,
  getSingleDevice: getSingleDevice,
  _createDeviceWithParameter: _createDeviceWithParameter
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function _createDeviceWithParameter(assetid, deviceobj) {
  return new Promise(
    (resolve, reject) => {
      const shortid = require('shortid');

      let device = new Device();

      for (var key in deviceobj) {
        device[key] = deviceobj[key];
      }

      device.DeviceID = "D" + shortid.generate();

      if (!device.DisplayName || !device.SerialNumber)

      device.save(err => {
        if (err)
        {
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
              reject(err);
            }
            else {
              // create parameter
              Promise.all(paralist.map(item => parameterManage._createParameter(device.DeviceID, item)))
                .then(
                  ret => {
                    resolve(device.DeviceID);
                  }
                )
                .catch(
                  err => {
                    reject(err);
                  }
                )
            }
          });

        }

      });
    });
}

function createDevice(req, res) {
  var deviceobj = req.body;
  console.log(req.body);
  var displayName = deviceobj.DisplayName;
  var assetid = deviceobj.AssetID;
  if (assetid && displayName) {
    const shortid = require('shortid');

    let device = new Device();

    device.DeviceID = "D" + shortid.generate();
    device.AddTimeStamp = Math.floor((new Date).getTime() / 1000);
    device.DisplayName = displayName;

    for (var key in deviceobj) {
      device[key] = deviceobj[key];
    }

    device.save(err => {
      if (err)
      {
        var msg = "device Save Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
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
            shareUtil.SendInternalErr(res,msg);
          }
          else {
            shareUtil.SendSuccess(res);
          }
        });

      }

    });
  } else {
    var msg = "AssetID or Display Name missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function updateDevice(req, res) {
  var deviceobj = req.body;
  var isValid = true;
  if (deviceobj.constructor === Object && Object.keys(deviceobj).length === 0) {
    shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
  } else {
    if (!deviceobj.DeviceID) {
      shareUtil.SendInvalidInput(res, shareUtil.constants.INVALID_INPUT);
    } else {
      Device.findOneAndUpdate({DeviceID: deviceobj.DeviceID}, deviceobj, function(err, data)
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

// Delete device by deviceID or by AssetID
// requires also AssetID in argument to delete the device from the table Asset in the Devices list attribute
function deleteDevice(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var deviceid = req.swagger.params.DeviceID.value;

  if (assetid) {
    if (deviceid) {
      // remove in user table and asset
      Device.deleteOne({DeviceID: deviceid}, function(err) {
        if (err)
        {
          var msg = "Error:" + JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res);
        }
        else{
          Asset.findOneAndUpdate({AssetID: assetid}, {
            $pull: {
              Devices: {DeviceID: deviceid}
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
      var msg = "DeviceID missing";
      shareUtil.SendInvalidInput(res, msg);
    }
  } else {
    var msg = "AssetID missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function getDeviceByAsset(req, res) {
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
        var deviceslist = data.Devices;
        Promise.all(deviceslist.map(_getSingleDevice))
          .then(
            ret => {
              shareUtil.SendSuccessWithData(res, ret);
            }
          )
          .catch(
            err => {
              var msg = "data Save Error:" + JSON.stringify(err, null, 2);
              shareUtil.SendInternalErr(res, msg);
            }
          )

        //getSingleDeviceInternal(0, deviceslist, [], function(deviceout){
        //  shareUtil.SendSuccessWithData(res, deviceout);
        //});
      } else {
        var msg = "AssetID does not exist";
        shareUtil.SendNotFound(res, msg);
      }
    }
  });
}


function getDeviceByAsset2(req, res) {
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
        var deviceslist = data.Devices;
        getSingleDeviceInternal(0, deviceslist, [], function(deviceout){
          shareUtil.SendSuccessWithData(res, deviceout);
        });
      } else {
        var msg = "AssetID does not exist";
        shareUtil.SendNotFound(res, data);
      }
    }
  });
}

function getSingleDeviceInternal(index, devices, deviceout, callback) {
  if (index < devices.length) {
    if (index == 0) {
      deviceout = [];
    }
    Device.findOne({DeviceID: devices[index].DeviceID},function(err,data){
      if (!err) {
        deviceout.push(data);
      }
      getSingleDeviceInternal(index + 1, devices, deviceout, callback);
    });
  } else {
    callback(deviceout);
  }
}



function _getSingleDevice(deviceobj) {
  return new Promise(
    (resolve, reject) => {
      parameterManage._getAllParameterByDeviceIDPromise(deviceobj.DeviceID)
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
    }
  );
}

function getSingleDevice(req, res) {
  var deviceid = req.swagger.params.DeviceID.value;
  parameterManage._getAllParameterByDeviceIDPromise(deviceid)
    .then(
      ret => {
        shareUtil.SendSuccessWithData(res, ret);
      }
    )
    .catch(
      err => {
        var msg =  "Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
      }
    )
}

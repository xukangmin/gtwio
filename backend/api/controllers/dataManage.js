//'use strict';

var shareUtil = require('./shareUtil.js');
const Data = require('../db/data.js');
const Device = require('../db/device.js');
const Parameter = require('../db/parameter.js');
const Asset = require('../db/asset.js');
//const Promise = require('bluebird');

var functions = {
  addDataByParameterID: addDataByParameterID,
  addDataBySerialNumber: addDataBySerialNumber,
  addDataByDeviceID: addDataByDeviceID,
  getDataByParameterID: getDataByParameterID,
  getDataBySerialNumber: getDataBySerialNumber,
  getDataByTag: getDataByDeviceTag,
  getDataByAssetID: getDataByAssetID,
  getDataByDeviceID: getDataByDeviceID,
  testFunc: testFunc
}

for (var key in functions) {
  module.exports[key] = functions[key];
}



function testFunc(req, res) {
    var dataobj = req.body;

    var devicearr = dataobj.Devices;

    var getDeviceData = function(deviceobj) {
      return new Promise(function(resolve, reject) {
          Device.findOne({DeviceID: deviceobj.DeviceID}, function(err, data) {
            if (data.DeviceID === 'Temp1')
            {
              reject('error');
            } else {
              resolve(data);
            }
            /*
            if (err) {
                reject(err);
            } else {
              resolve(data);
            }*/
          });
      });

    }

    Promise.all(devicearr.map(getDeviceData))
      .then(data =>
        {
          console.log(data)
          shareUtil.SendSuccessWithData(res, data);
        })
      .catch(function(err) {
          console.log(err);
          shareUtil.SendInternalErr(res, err);
      });

}

function _addDataByParameterID(paraID, value, timestamp, callback) {
  let data = new Data();
  data.ParameterID = paraID;
  data.Value = value;
  data.TimeStamp = timestamp;

  data.save(err => {
    callback(err);
  });
}

function _addDataByParameterIDPromise(para, value, timestamp) {
  return new Promise(
      (resolve, reject) => {
        let data = new Data();
        data.ParameterID = para.ParameterID;
        data.Value = value;
        data.TimeStamp = timestamp;

        data.save(err => {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        });
      }
  );
}

function addDataByParameterID(req, res) {
  var dataobj = req.body;

  if (dataobj.ParameterID)
  {
    var parid = dataobj.ParameterID;
    var val = dataobj.Value;

    var timestamp;
    if (dataobj.TimeStamp)
    {
      timestamp = dataobj.TimeStamp;
    }
    else {
      timestamp = Math.floor((new Date).getTime());
    }

    _addDataByParameterID(parid, val, timestamp, function(err) {
      if (err)
      {
        var msg = "data Save Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
      }
      else {
        shareUtil.SendSuccess(res);

      }
    });
  }


}

function _getParameter(paraobj) {
  return new Promise(
    (resolve, reject) => {
        Parameter.findOne({ParameterID: paraobj.ParameterID}, function(err, data){
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
    }
  );
}

function _getAllParameterByDeviceID(deviceid, callback) {
  Device.findOne({DeviceID: deviceid}, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      Promise.all(data.Parameters.map(_getParameter))
        .then(ret => {
          callback(null, ret);
        })
        .catch(err => {
          callback(err, null);
        })
    }

  });
}

function _getAllParameterBySerialNumber(sn, callback) {

  Device.findOne({SerialNumber: sn}, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      Promise.all(data.Parameters.map(_getParameter))
        .then(ret => {
          callback(null, ret);
        })
        .catch(err => {
          callback(err, null);
        })
    }

  });
}

function _getParameterByDeviceID(deviceid) {
  return new Promise(
    (resolve, reject) => {
        Device.findOne({DeviceID: deviceid}, function(err, data){
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
    }
  );
}





function _getAllParameterByAssetID(assetid, callback) {

  var allpara = [];

  Asset.findOne({AssetID: assetid}, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
        // first get parameter in asset
        _getSingleParameterInternal(0, data.Parameters, [], function(paralist) {
            if (paralist.length > 0){
                allpara = concat(paralist);
            }


            // then get all parameter for all devices
            _getSingleDeviceParameterInternal(0, data.Devices, [], function(paralist1) {
              if (paralist1.length > 0){
                  allpara = concat(paralist1);
              }
              callback(allpara);
            });
        });
    }
  });
}

function addDataByDeviceID(req, res)  {
  var dataobj = req.body;

  if (dataobj.DeviceID && dataobj.Value && dataobj.DataType)
  {

    // find parameter id
    _getAllParameterByDeviceID(dataobj.DeviceID, function(err, data){
      if (err) {
        var msg = "Device find Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
      } else {
        // add same data to all qualified parameters
        var timestamp = 0;
        if (dataobj.TimeStamp)
        {
          timestamp = dataobj.TimeStamp;
        } else {
          timestamp = timestamp = Math.floor((new Date).getTime());
        }
        data = data.filter(item => item.Type === dataobj.DataType);
        if (data.length > 0)
        {
          Promise.all(data.map(item => _addDataByParameterIDPromise(item, dataobj.Value, timestamp)))
            .then(() => {
              shareUtil.SendSuccess(res);
            })
            .catch(err => {
              shareUtil.SendInternalErr(res,  "data add error:" + JSON.stringify(err, null, 2));
            });
        } else {
          shareUtil.SendSuccessWithData(res, {message: 'No data added'});
        }
      }
    });
  } else {
    var msg = "DeviceID or Value or DataType missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function addDataBySerialNumber(req, res) {
  var dataobj = req.body;

  if (dataobj.SerialNumber && dataobj.Value && dataobj.DataType)
  {

    // find parameter id
    _getAllParameterBySerialNumber(dataobj.SerialNumber, function(err, data){
      if (err) {
        var msg = "Device find Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
      } else {
        // add same data to all qualified parameters
        var timestamp = 0;
        if (dataobj.TimeStamp)
        {
          timestamp = dataobj.TimeStamp;
        } else {
          timestamp = timestamp = Math.floor((new Date).getTime());
        }
        data = data.filter(item => item.Type === dataobj.DataType);
        if (data.length > 0)
        {
          Promise.all(data.map(item => _addDataByParameterIDPromise(item, dataobj.Value, timestamp)))
            .then(() => {
              shareUtil.SendSuccess(res);
            })
            .catch(err => {
              shareUtil.SendInternalErr(res,  "data add error:" + JSON.stringify(err, null, 2));
            });
        } else {
          shareUtil.SendSuccessWithData(res, {message: 'No data added'});
        }
      }
    });
  } else {
    var msg = "SerialNumber or Value or DataType missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function _getSingleParameterInternal(index, parameters, parameterout, callback) {
  if (index < parameters.length) {
    if (index == 0) {
      deviceout = [];
    }
    Parameter.findOne({ParameterID: parameters[index].ParameterID},function(err,data){
      if (!err) {
        parameterout.push(data);
      }
      getSingleParameterInternal(index + 1, parameters, parameterout, callback);
    });
  } else {
    callback(parameterout);
  }
}

function _getDataByParameterID(para, sTS, eTS) {
  return new Promise(
    (resolve, reject) => {
      Data.find({ParameterID: para.ParameterID, TimeStamp: {$gte: sTS, $lte: eTS}}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }
  );
}

function getDataByParameterID(req, res) {
  var paraID = req.swagger.params.ParameterID.value;
  var sTS = req.swagger.params.StartTimeStamp.value;
  var eTS = req.swagger.params.EndTimeStamp.value;

  if (paraID && sTS && eTS) {
    Data.find({ParameterID: paraID, TimeStamp: { $gte : sTS, $lte: eTS} }, function(err, data) {
      if (err) {
        shareUtil.SendInternalErr(res,  "data add error:" + JSON.stringify(err, null, 2));
      } else {
        if (data.length > 0) {
          shareUtil.SendSuccessWithData(res, data);
        } else {
          var msg = "SerialNumber or Value or DataType missing";
          shareUtil.SendInvalidInput(res, msg);
        }
      }
    });
  } else {
    var msg = "ParameterID or StartTimeStamp or EndTimeStamp missing";
    shareUtil.SendInvalidInput(res, msg);
  }

}
function getDataBySerialNumber(req, res) {
  var sn = req.swagger.params.SerialNumber.value;
  var sTS = req.swagger.params.StartTimeStamp.value;
  var eTS = req.swagger.params.EndTimeStamp.value;

  if (sn && sTS && eTS) {
    _getAllParameterBySerialNumber(sn, function(err,data) {
      if (err) {
        shareUtil.SendInternalErr(res,  "serail number search error:" + JSON.stringify(err, null, 2));
      } else {

        Promise.all(data.map(item => _getDataByParameterID(item, sTS, eTS)))
          .then(ret => {
            shareUtil.SendSuccessWithData(res, ret);
          })
          .catch(err => {
            shareUtil.SendInternalErr(res,  "serail number search error:" + JSON.stringify(err, null, 2));
          });
      }
    });
  } else {
    var msg = "SerialNumber or StartTimeStamp or EndTimeStamp missing";
    shareUtil.SendInvalidInput(res, msg);
  }


}
function getDataByDeviceTag(req, res) {

}

function getDataByParameterTag(req, res) {

}

function getDataByAssetID(req, res) {

}
function getDataByDeviceID(req, res) {

}

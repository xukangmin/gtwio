//'use strict';

var shareUtil = require('./shareUtil.js');
const Data = require('../db/data.js');
const Device = require('../db/device.js');
const Parameter = require('../db/parameter.js');
const Asset = require('../db/asset.js');

var functions = {
  addDataByParameterID: addDataByParameterID,
  addDataBySerialNumber: addDataBySerialNumber,
  getDataByParameterName: getDataByParameterName,
  getDataByParameterID: getDataByParameterID,
  getDataBySerialNumber: getDataBySerialNumber,
  getDataByDeviceTag: getDataByDeviceTag,
  getDataByParameterTag: getDataByParameterTag,
  getDataByAssetID: getDataByAssetID,
  getDataByDeviceID: getDataByDeviceID
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function addDataByParameterID(req, res) {
  var dataobj = req.body;

  if (dataobj.ParameterID)
  {
    let data = new Data();
    data.ParameterID = dataobj.ParameterID;
    data.Value = dataobj.Value;
    if (!data.AddTimeStamp) { data.AddTimeStamp = Math.floor((new Date).getTime()); }

    data.save(err => {
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

function addDataBySerialNumber(req, res) {
  var dataobj = req.body;

  if (dataobj.SerialNumber && dataobj.Value && dataobj.DataType)
  {
    // find parameter id
    Device.findOne({SerialNumber: dataobj.SerialNumber}, function(err, data) {
      if (err)
      {
        var msg = "Device find Error:" + JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res,msg);
      } else {
        if (data)
        {
          if (data.Parameters && data.Parameters.length > 0) {
            // parameter exists, find
            getSingleParameterInternal(0, data.Parameters, [], function(parameterlist) {

              var ret = parameterlist.filter(item => item.Type === dataobj.DataType);
              console.log(ret);
            });
          } else {
            // parameter not exists or length == 0

          }
        }
        else {
          var msg = "Cannot find device with serial number " + dataobj.SerialNumber;
          shareUtil.SendInvalidInput(res, msg);
        }


      }
    });

  } else {
    var msg = "SerialNumber or Value or DataType missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function getSingleParameterInternal(index, parameters, parameterout, callback) {
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

function getDataByParameterName(req, res) {

}
function getDataByParameterID(req, res) {

}
function getDataBySerialNumber(req, res) {

}
function getDataByDeviceTag(req, res) {

}

function getDataByParameterTag(req, res) {

}

function getDataByAssetID(req, res) {

}
function getDataByDeviceID(req, res) {

}

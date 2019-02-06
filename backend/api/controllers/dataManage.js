//'use strict';

var shareUtil = require('./shareUtil.js');
const Data = require('../db/data.js');
const Device = require('../db/device.js');
const Parameter = require('../db/parameter.js');
const Asset = require('../db/asset.js');
const math = require('mathjs');
//const Promise = require('bluebird');

var functions = {
  addDataByParameterID: addDataByParameterID,
  addDataBySerialNumber: addDataBySerialNumber,
  addDataByDeviceID: addDataByDeviceID,
  getDataByParameterID: getDataByParameterID,
  getDataBySerialNumber: getDataBySerialNumber,
  getDataByTag: getDataByTag,
  getDataByAssetID: getDataByAssetID,
  getDataByDeviceID: getDataByDeviceID,
  testFunc: testFunc
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

var datareq = [];
var rawdataobj = {};

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
function _getSingleDataPoint(paraid, currentTimeStamp) {
    return new Promise(
      (resolve, reject) => {
        // get previous 10 minutes data
        Data.find({ParameterID: paraid,  TimeStamp: {$gte: currentTimeStamp - 600000, $lte: currentTimeStamp}}, 'Value TimeStamp -_id', function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }

        });
      }
    );
}

function _perform_calculation(dataobj, equation) {
  return new Promise(
    (resolve, reject) => {
      //console.log("_perform_calculation:");
      //console.log(dataobj);
      var new_eval = equation.replace('Avg', 'math.mean');

      for(var i = 0; i < dataobj.length; i++) {
        new_eval = new_eval.replace(dataobj[i].ParameterID, dataobj[i].Value.toString());
      }
      var new_eval = new_eval.replace(/[\[\]]/g,'');
      //console.log(new_eval);
      try {

        var result = eval(new_eval);
        resolve(result);
      }
      catch(err) {
        console.error(err);
        reject(err);
      }
    }
  );
}

function trigger_single_parameter_calculation(paraid, dataobj) {
  //console.log("trigger paraid=" + paraid);

  Parameter.findOne({ParameterID: paraid}, function(err,data){
      if (!err) {
          var currentTimeStamp = Math.floor((new Date).getTime());
          // do calculation
          // first gett all data;
          if (data) {
            if (data.Require) {
              if (data.Require.length > 0) {
                if (rawdataobj[paraid])
                {
                  var data_exist = false;
                  for (var i in rawdataobj[paraid])
                  {
                    if (rawdataobj[paraid][i].ParameterID === dataobj.ParameterID) {
                      rawdataobj[paraid].splice(i,1,dataobj);
                      data_exist = true;
                    }
                  }
                  if (!data_exist) {
                    rawdataobj[paraid].push(dataobj);
                  }
                } else {
                  rawdataobj[paraid] = [];
                  rawdataobj[paraid].push(dataobj);

                }
        //        console.log(rawdataobj);

                var all_match = true;
                var datareqobj = data.Require.toObject();
                var max_timestamp = 0;
                for (var i in datareqobj) {
                  var check = false;
                  for (var j in rawdataobj[paraid]) {
                      if (rawdataobj[paraid][j].ParameterID === datareqobj[i]) {
                        check = true;
                      }
                  }


                  if (!check) {
                    all_match = false;
                  }
                }

                if (all_match) {
                  //console.log("trigger calculation");
                  var max_timestamp = 0;
                  for(var i in rawdataobj[paraid]) {
                    if (rawdataobj[paraid][i].TimeStamp > max_timestamp)
                    {
                      max_timestamp = rawdataobj[paraid][i].TimeStamp;
                    }
                  }

                  _perform_calculation(rawdataobj[paraid], data.Equation)
                    .then(
                      ret => {
                        rawdataobj[paraid] = [];
                        //console.log(ret);
                        _addDataByParameterID(paraid, ret, max_timestamp, err => {if(err) console.error(err)});
                      }
                    )
                    .catch(
                      err => {
                        console.error(err);
                      }
                    )
                }
                //
              }
            }
            /*
            if (data.RequiredBy)
            {
              for (var i in data.RequiredBy) {
                // trigger calculation for each para id
                trigger_single_parameter_calculation(data.RequiredBy[i]);
              }
            }*/
          }

                    //after calculation, trigger other parameters


      }
  });
}

function trigger_all_parameters(dataobj) {
  Parameter.findOne({ParameterID: dataobj.ParameterID}, function(err, data) {
    if (err)
    {
      console.log(err);
    } else {
      if (data) {
        if (data.RequiredBy) {
          if (data.RequiredBy.length > 0) {
            for (var i = 0; i < data.RequiredBy.length; i++) {
              trigger_single_parameter_calculation(data.RequiredBy[i], dataobj);
            }
          }
        }
      }


    }
  });
}

function _addDataByParameterID(paraID, value, timestamp, callback) {
  let data = new Data();
  data.ParameterID = paraID;
  data.Value = value;
  data.TimeStamp = timestamp;
  var dataobj = {
    ParameterID: paraID,
    Value: value,
    TimeStamp: timestamp
  };
  console.log("_addDataByParameterID: " + paraID + " , " + value + " , " + timestamp);
//  console.log(paraID);
//  console.log(value);
  data.save(err => {
    // trigger calculation
    trigger_all_parameters(dataobj);
    if (err)
    {
      callback(err);
    } else {
      Parameter.findOneAndUpdate({ParameterID: paraID},{CurrentValue: value, CurrentTimeStamp: timestamp}, function(err) {
        callback(err);
      });
    }
  });
}

function _getDeviceInfoByDeviceID(deviceobj) {
  return new Promise(
    (resolve, reject) => {
      Device.findOne({DeviceID: deviceobj.DeviceID}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }
  );
}

function _addDataByParameterIDPromise(para, value, timestamp) {
  return new Promise(
      (resolve, reject) => {
        _addDataByParameterID(para.ParameterID, value, timestamp, function(err){
          if (err) {
            reject(err);
          } else {
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

function _getAllParameterByDeviceIDPromise(deviceobj) {
  return new Promise(
    (resolve, reject) => {
      Device.findOne({DeviceID: deviceobj.DeviceID}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          Promise.all(data.Parameters.map(_getParameter))
            .then(ret => {
              resolve(ret);
            })
            .catch(err => {
              reject(err);
            })
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


function _getAllParameterByAssetIDPromise(assetid) {
    return new Promise(
        (resolve, reject) => {
          Asset.findOne({AssetID: assetid}, function(err, data) {
            if (err) {
              reject(err);
            } else {
              Promise.all(data.Parameters.map(_getParameter))
                .then(ret => {
                  resolve(ret);
                })
                .catch(err => {
                  reject(err);
                })
            }
          });
        }
    );
}

function _getAllDeviceByAssetID(assetid) {
    return new Promise(
        (resolve, reject) => {
          Asset.findOne({AssetID: assetid}, function(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data.Devices);
            }
          });
        }
    );
}

function _cleanDeviceObj(deviceobj) {
  for(var key in deviceobj){
    if (!(key == "SerialNumber" || key == "DeviceID" || key == "DisplayName" || key == "Angle" || key == "Tag")){
      delete deviceobj[key];
    }
  }
return deviceobj;
}


function _getRawDataByType(deviceobj, type, sTS, eTS) {
    return new Promise(
      (resolve, reject) => {
          Promise.all(deviceobj.Parameters.map(_getParameter))
            .then(
              ret => {
                var parameter = null;
                ret = ret.filter(item => item.Type === type);
                if (ret.length === 1)
                {
                  parameter = ret[0];
                }
                else {
                  reject('parameter type not unique');
                }
                return _getDataByParameterID(parameter, sTS, eTS);
              }
            )
            .then(
              data => {
                  let dev = deviceobj.toObject();
                  dev = _cleanDeviceObj(dev);
                  dev.Data = data;
                  var dataarr = data.map(item => item.Value);
                  var stat = {};
                  var sum = dataarr.reduce((total, p) => total + p, 0);
                  var avg = sum / dataarr.length;
                  var min = dataarr.reduce((min, p) => Math.min(min,p));
                  var max = dataarr.reduce((max, p) => Math.max(max,p));
                  var stdev = math.std(dataarr);
                  stat.Sum = sum;
                  stat.Avg = avg;
                  stat.Min = min;
                  stat.Max = max;
                  stat.STDEV = stdev;
                  dev.DataStatistics = stat;
                  resolve(dev);
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

function _getRawDataByTagAndType(assetid, tag, type, sTS, eTS, callback) {
  _getAllDeviceByAssetID(assetid)
    .then(
      devicelist => {
        return Promise.all(devicelist.map(_getDeviceInfoByDeviceID));
      }
    )
    .then(
      devicelist =>
      {
        devicelist = devicelist.filter(item => item.Tag === tag);
        return Promise.all(devicelist.map(item => _getRawDataByType(item, type, sTS, eTS)));
      }
    )
    .then(
      ret => {
        callback(null, ret);
      }
    )
    .catch(
      err => {
        callback(err, null);
      }
    )
}

function _getAllParameterByTagAndType(assetid, tag, type, sTS, eTS, callback) {

  var para = [];
  console.log("start");
  console.log(assetid);
  console.log(tag);
  _getAllParameterByAssetIDPromise(assetid)
    .then(
      data =>
      {
        para = para.concat(data);
        console.log(para);
        return _getAllDeviceByAssetID(assetid);
      })
    .then(
      devicelist => {
        return Promise.all(devicelist.map(_getAllParameterByDeviceIDPromise));
      }
    )
    .then(
      ret => {
        para = para.concat(ret);

        var paralist = [];

        for (let i in para) {
          for (let j in para[i]) {
            paralist = paralist.concat(para[i][j]);
          }
        }

        paralist = paralist.filter(item => (item.Tag === tag || item.Tag === tag + "/" + type));


        return Promise.all(paralist.map(item => _getDataByParameterID(item, sTS, eTS) ));
      }
    )
    .then(
      ret => {
        console.log(ret);
        callback(null, ret);
      }
    )
    .catch(
      err => {
        callback(err, null);
      }
    )
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
          timestamp = Math.floor((new Date).getTime());
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
          timestamp = Math.floor((new Date).getTime());
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

function _cleanData(dataobj) {
  for(var key in dataobj){
  if (!(key == "TimeStamp" || key == "Value")){
    //console.log("delete key " + key);
    delete dataobj[key];
   }
  }
  return dataobj;
}

function _getDataByParameterID(para, sTS, eTS) {
  return new Promise(
    (resolve, reject) => {
      Data.find({ParameterID: para.ParameterID, TimeStamp: {$gte: sTS, $lte: eTS}},'TimeStamp Value -_id', function(err, data) {
        if (err) {
          console.log(err);
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
function getDataByTag(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var tag = req.swagger.params.Tag.value;
  var sTS = req.swagger.params.StartTimeStamp.value;
  var eTS = req.swagger.params.EndTimeStamp.value;
  var type = req.swagger.params.Type.value;
  if (assetid && tag && type && sTS && eTS) {
    _getRawDataByTagAndType(assetid, tag,type, sTS, eTS, function(err, data) {
      if (err) {
        shareUtil.SendInternalErr(res,  "tag search error:" + JSON.stringify(err, null, 2));
      } else {
        shareUtil.SendSuccessWithData(res, data);
      }
    });
  } else {
    var msg = "assetid or tag or type or StartTimeStamp or EndTimeStamp missing";
    shareUtil.SendInvalidInput(res, msg);
  }

}

function getDataByParameterTag(req, res) {

}

function getDataByAssetID(req, res) {

}
function getDataByDeviceID(req, res) {

}

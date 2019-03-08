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
  testFunc: testFunc,
  addDataByParticleEvent: addDataByParticleEvent
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

function compareStrings (string1, string2, ignoreCase) {
    if (ignoreCase) {
            string1 = string1.toLowerCase();
            string2 = string2.toLowerCase();
    }

    return string1 === string2;
}

function _resolve_parameter(strpara, latestTimeStamp, dataobj) {
  // [ParaID, Operation, Time to look back, offset]
  return new Promise(
    (resolve, reject) => {
      var plist = strpara.replace(/[\[\]]/g,'').split(',');
      var paraid, op, timerange, offset;

      if (plist.length > 4 || plist.length === 0)
      {
        reject(new Error('wrong format'));
      } else {
        if (plist.length === 1) {
          paraid = plist[0];
          op = "Current";
          timerange = 0;
          offset = 0;
        } else if (plist.length === 2) {
          paraid = plist[0];
          op = "avg";
          timerange = plist[1];
          offset = 0;
        } else if (plist.length === 3) {
          paraid = plist[0];
          op = plist[1];
          timerange = plist[2];
          offset = 0;
        } else if (plist.length === 4) {
          paraid = plist[0];
          op = plist[1];
          timerange = plist[2];
          offset = plist[4];
        }

        if (timerange == 0 || compareStrings(op,"Current") || compareStrings(op,"LAST")) {
          var result =  dataobj.find(item => item.ParameterID === paraid).Value;
          resolve(result);
        }
        else {
          _getDataByParameterID({ParameterID: paraid}, latestTimeStamp - offset - timerange, latestTimeStamp - offset)
            .then(
              data => {
                // first sort data
                 if (data.length > 0) {
                   data.sort((a,b) => a.TimeStamp - b.TimeStamp);
                   var dataarr = data.map(item => item.Value);
                   if (compareStrings(op,"AVG") || compareStrings(op,"MEAN")) { // average data
                      var result = math.mean(dataarr);
                      resolve(result);
                   } else if (compareStrings(op,"MAX")) {
                     var result = math.max(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"MIN")) {
                     var result = math.min(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"COUNT")) {
                     var result = dataarr.length;
                     resolve(result);
                   } else if (compareStrings(op,"MEDIAN")) {
                     var result = math.median(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"SUM")) {
                     var result = math.sum(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"FIRST")) {
                     var result = dataarr[0];
                     resolve(result);
                   }
                   else {
                     reject(new Error('Operation not defined'))
                   }
                 } else {
                   reject(new Error('data not exist'));
                 }
              }
            )
            .catch(
              err => {
                reject(err);
              }
            );
        }


      }



    });

}
function _math_op_convert(streval) {
  streval = streval.replace(/avg/ig,'mean');
  return streval;
}

function _perform_calculation(dataobj, equation, latestTimeStamp) {
  return new Promise(
    (resolve, reject) => {
      //console.log("_perform_calculation:");
      //console.log(dataobj);
      var new_eval = equation;

      var reg = /\[[^\]]+\]/g;

      var paralist = equation.match(reg);

      Promise.all(paralist.map(item => _resolve_parameter(item, latestTimeStamp, dataobj)))
        .then(
          ret => {
            //console.log(ret);
            for(var i = 0; i < paralist.length; i++) {
              new_eval = new_eval.replace(paralist[i], ret[i].toString());
            }
            new_eval = _math_op_convert(new_eval);
            new_eval = new_eval.replace(/[\[\]]/g,'');
            //console.log(new_eval);
            try {
              var result = math.eval(new_eval);
              //console.log(result);
              resolve(result);
            }
            catch(err) {
              console.error(err);
              reject(err);
            }
          }
        )
        .catch(
          err => {
            console.error(err);
          }
        );


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

                  _perform_calculation(rawdataobj[paraid], data.Equation, max_timestamp)
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

function _update_stability_info(paraID, info, stdev, code) {
  return new Promise(
    (resolve, reject) => {
      Parameter.findOneAndUpdate({ParameterID: paraID}, {Status: info, StandardDeviation: stdev, StatusCode: code}, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(stdev);
        }
      });
    });
}

function _calculate_stability(paraID, stabilityCriteria, timestamp) {
  return new Promise(
    (resolve, reject) => {
      _getDataByParameterID({ParameterID: paraID}, timestamp - stabilityCriteria.WindowSize * 60 * 1000, timestamp)
        .then(
          data => {
            // calculate F / hr
            var rate;
            if (data.length > 0) {
              var diff = Math.abs(data[0].Value - data[data.length - 1].Value);
              rate = diff / stabilityCriteria.WindowSize / 60;
            } else {
              rate = -1;
            }
            // console.log(data);
            // var result = [];
            // for(var i in data) {
            //   result.push(data[i].Value);
            // }
            // var stdev = math.std(result);
            resolve(rate);
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
function _update_single_data(paraID, timestamp, valid) {
    Data.findOneAndUpdate({ParameterID: paraID, TimeStamp: timestamp}, {Valid: valid}, function(err) {
      if (err) {
        console.error(err);
      }
    })
}

function _update_status(paraID, timestamp, currentValue) {
  // get StabilityCriteria
//  console.log(paraID);
//  console.log(timestamp);
  Parameter.findOne({ParameterID: paraID}, function(err, data) {
    if (!err) {
      //console.log(data);
      if (data) {
        if (data.StabilityCriteria) {
          if (!(JSON.stringify(data.StabilityCriteria) == "{}"))
          {
            //console.log(data.StabilityCriteria);
            _calculate_stability(paraID, data.StabilityCriteria, timestamp)
              .then(
                stdev => {
                  var status_text = 'Valid';
                  var valid = true;
                  var code = 0;
                  if (stdev > data.StabilityCriteria.UpperLimit) {
                    status_text = 'Not stable';
                    code = 1;
                    valid = false;
                  }
                  if (data.Range)
                  {
                      if (currentValue > data.Range.UpperLimit || currentValue < data.Range.LowerLimit)
                      {
                        status_text = 'Out of Range';
                        code = 2;
                        valid = false;
                      }
                  }
                  _update_single_data(paraID, timestamp, valid);
                  return _update_stability_info(paraID, status_text, stdev, code);
                }
              )
              .then(
                ret => {

                }
              )
              .catch(
                err => {
                  console.error(err);
                }
              );
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
//  console.log("_addDataByParameterID: " + paraID + " , " + value + " , " + timestamp);
//  console.log(paraID);
//  console.log(value);
  data.save(err => {
    // trigger calculation
    trigger_all_parameters(dataobj);
    _update_status(paraID, timestamp, value);
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

function _getRawDataByDevice(deviceobj, sTS, eTS) {
  return new Promise(
    (resolve, reject) => {
      Promise.all(deviceobj.Parameters.map(_getParameter))
        .then(

        )
    });
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
                  console.log(ret);
                  reject('parameter type not unique');
                }
                return _getDataByParameterID(parameter, sTS, eTS);
              }
            )
            .then(
              data => {
                  if (data.length === 0)
                  {
                    resolve(data);
                  } else
                  {
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

function _addDataBySerialNumber(sn, ts, value, type, callback) {
  return new Promise(
    (resolve, reject) => {
      _getAllParameterBySerialNumber(sn, function(err, data){
        if (err) {
          reject(err);
        } else {
          // add same data to all qualified parameters
          var timestamp = 0;
          if (ts)
          {
            timestamp = ts;
          } else {
            timestamp = Math.floor((new Date).getTime());
          }
          data = data.filter(item => item.Type === type);
          if (data.length > 0)
          {
            Promise.all(data.map(item => _addDataByParameterIDPromise(item, value, timestamp)))
              .then(() => {
                resolve(null);
              })
              .catch(err => {
                reject(err);
              });
          } else {
            // consider add parameter with type
            reject(new Error("no parameter exist"));
          }
        }
      });
    });

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
      Data.find({ParameterID: para.ParameterID, TimeStamp: {$gte: sTS, $lte: eTS}},'TimeStamp Value Valid -_id', function(err, data) {
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

function addDataByParticleEvent(req, res) {
  var p_data = req.body;

  if (p_data.data && p_data.event) {
    // parse data format = timestamp,deviceid1, data, deviceid2, data, deviceid3, data
    var dlist = p_data.data.split(",");

    var num_data = (dlist.length - 1) / 2;

    var type = "Unknown";

    if (p_data.event) {
      if (p_data.event == "hx/t") {
        type = "Temperature";
      }
    }
    var devicelist = [];
    var timestamp = Number(dlist[0]) * 1000;

    for (var i = 0; i < num_data; i++){
      var single_device = {
                            SerialNumber: dlist[i * 2 + 1],
                            Value: Number(dlist[i * 2 + 2])
                          };
      devicelist.push(single_device);
    }

    Promise.all(devicelist.map(item => _addDataBySerialNumber(item.SerialNumber,timestamp, item.Value, type)))
      .then(
        ret => {
          shareUtil.SendSuccess(res);
        }
      )
      .catch(
        err => {
          shareUtil.SendInternalErr(res,  "data add error:" + JSON.stringify(err, null, 2));
        }
      )


  } else {
    var msg = "missing data key";
    shareUtil.SendInvalidInput(res, msg);
  }


}

function getDataByParameterTag(req, res) {

}

function getDataByAssetID(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var sTS = req.swagger.params.StartTimeStamp.value;
  var eTS = req.swagger.params.EndTimeStamp.value;



  if (assetid && sTS && eTS) {
    // get device
    console.log(assetid);
    _getAllDeviceByAssetID(assetid)
      .then(
        devicelist => {
          return Promise.all(devicelist.map(_getDeviceInfoByDeviceID));
        }
      )
      .then(
        devicelist =>
        {
          return Promise.all(devicelist.map(_getAllParameterByDeviceIDPromise));
        }
      )
      .then(
        ret => {
          console.log(ret);
        }
      )
      .catch(
        err => {
          shareUtil.SendInvalidInput(res, "getDataByAssetID error:" + JSON.stringify(err, null, 2));
        }
      )
  } else {
    var msg = "assetid  or StartTimeStamp or EndTimeStamp missing";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function getDataByDeviceID(req, res) {

}

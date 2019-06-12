//'use strict';

var shareUtil = require('./shareUtil.js');
const Data = require('../db/data.js');
const Device = require('../db/device.js');
const Parameter = require('../db/parameter.js');
const Asset = require('../db/asset.js');
const math = require('mathjs');
const path = require('path');
var assetManage = require('./assetManage.js');
var parameterManage = require('./parameterManage.js');
var assetManage = require('./assetManage.js');
var jStat = require('jStat').jStat;
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
  getDataForBaselineSelection: getDataForBaselineSelection,
  getCalculatedDataForBaseline: getCalculatedDataForBaseline,
  testFunc: testFunc,
  addDataByParticleEvent: addDataByParticleEvent,
  _getAllParameterByAssetID: _getAllParameterByAssetID,
  _getAllParameterByAssetIDPromise: _getAllParameterByAssetIDPromise,
  _getAllDeviceByAssetID: _getAllDeviceByAssetID,
  _deleteAllData:_deleteAllData,
  _recalculateAsset: _recalculateAsset
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

var datareq = [];
var rawdataobj = {};

function _deleteAllData(paraobj) {
  return new Promise(
    (resolve, reject) => {
      Data.deleteMany({ParameterID: paraobj.ParameterID}, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
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

    return string1.includes(string2);
}

function _resolve_parameter(strpara, latestTimeStamp, dataobj) {
  // [ParaID, Operation, Time to look back, offset]
  return new Promise(
    (resolve, reject) => {
      // console.log(strpara);
      // console.log(latestTimeStamp);
      // console.log(dataobj);
      
      
      var plist = strpara.replace(/[\[\]]/g,'').split(',');
      var paraid, op, timerange, offset, startTS, endTS, opts;

      if (plist.length > 5 || plist.length === 0)
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

          op = "AVG";
          timerange = parseInt(plist[1]);
          offset = 0;

        } else if (plist.length === 3) {
          paraid = plist[0];
          op = plist[1];
          timerange = parseInt(plist[2]);
          offset = 0;
        } else if (plist.length === 4) {
          paraid = plist[0];
          op = plist[1];
          timerange = parseInt(plist[2]);
          offset = parseInt(plist[3]);
        } else if (plist.length === 5) {
          paraid = plist[0];
          op = plist[1];
          opts = plist[2]; 
          if (compareStrings(opts, "SC", true))
          {
            startTS = parseInt(plist[3]);
            endTS = latestTimeStamp;
          } else {
            startTS = parseInt(plist[3]);
            endTS = parseInt(plist[4]);
          }

        }

        if (compareStrings(strpara,"BASELINE", true)) {
          reject("Baseline not defined in parameter");
        }
        else if (timerange == 0 || compareStrings(op,"Current", true) || compareStrings(op, "LAST", true)) {
          var result =  dataobj.find(item => item.ParameterID === paraid).Value;
          resolve(result);
        }
        else {

          if (plist.length < 5)
          {
            if (compareStrings(op,"FIX", true)) {
              // console.log("FIX DATA");
              
              if (offset === 0) {
                offset = 300000;  // default offset 5 mins
              }
              startTS = timerange - offset;
              endTS = timerange + offset;
            } else {
              startTS = latestTimeStamp - offset - timerange;
              endTS = latestTimeStamp - offset;
            }
          }


          // console.log("startTS=" + startTS);
          // console.log("endTS=" + endTS);
          _getDataByParameterID({ParameterID: paraid}, startTS, endTS)
            .then(
              data => {
                // first sort data
                 if (data.length > 0) {
                   data.sort((a,b) => a.TimeStamp - b.TimeStamp);
                   var dataarr = data.map(item => item.Value);
                   if (compareStrings(op,"AVG", true) || compareStrings(op,"MEAN", true)) { // average data
                      var result = math.mean(dataarr);
                      resolve(result);
                   } else if (compareStrings(op,"MAX", true)) {
                     var result = math.max(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"MIN", true)) {
                     var result = math.min(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"COUNT", true)) {
                     var result = dataarr.length;
                     resolve(result);
                   } else if (compareStrings(op,"MEDIAN", true)) {
                     var result = math.median(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"SUM", true)) {
                     var result = math.sum(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"FIRST", true)) {
                     var result = dataarr[0];
                     resolve(result);
                   } else if (compareStrings(op,"FIX", true)) {
                     var result = math.mean(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"STD", true)) {
                     var result = math.std(dataarr);
                     resolve(result);
                   } else if (compareStrings(op,"RAW", true)) {
                     var result = dataarr.join(',');
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
      // console.log("_perform_calculation:");
      // console.log(dataobj);
      // console.log(equation);
      var new_eval = equation;

      var reg = /\[[^\]]+\]/g;

      var paralist = equation.match(reg);

      Promise.all(paralist.map(item => _resolve_parameter(item, latestTimeStamp, dataobj)))
        .then(
          ret => {
            // console.log(ret);
            for(var i = 0; i < paralist.length; i++) {
              new_eval = new_eval.replace(paralist[i], ret[i].toString());
            }
            new_eval = _math_op_convert(new_eval);
            new_eval = new_eval.replace(/[\[\]]/g,'');
            // console.log("new_eval=" + new_eval);

            const parser = math.parser();

            parser.set('t_value', function (X, df) {
              if (df == 0)
              {
                return 0;
              } else {
                return -jStat.studentt.inv(X/2,df);
              }
              
            });
            
            parser.set('count', function (...args) {
              return args.length;
            });
            
            try {
              var result = parser.eval(new_eval);
              var ret = {};

              ret.Result = result;
              ret.ResolvedEquation = new_eval
              // console.log("result=" + result);
              resolve(ret);
            }
            catch(err) {
              // console.log("error1:");
              // console.error(err);
              reject(err);
            }
          }
        )
        .catch(
          err => {
            //console.log(err);
            reject(err);
          }
        );


    }
  );
}

function get_start_ts(ts) {
  return ts - ts % 60000;
}

function trigger_single_parameter_calculation(paraid, dataobj) {
  //console.log("trigger paraid=" + paraid);

  Parameter.findOne({ParameterID: paraid}, function(err,data){
      if (!err) {
          var currentTimeStamp = Math.floor((new Date).getTime());
          // do calculation
          // first get all data;
          if (data) {
            if (data.Require) {
              if (data.Require.length > 0) {
                var timesp = get_start_ts(dataobj.TimeStamp);

                if (rawdataobj[paraid])
                {
                  if (rawdataobj[paraid][timesp]){
                    // key exists
                    var data_exist = false;
                    for (var i in rawdataobj[paraid][timesp])
                    {
                      if (rawdataobj[paraid][timesp][i].ParameterID === dataobj.ParameterID) {
                        rawdataobj[paraid][timesp].splice(i,1,dataobj);
                        data_exist = true;
                      }
                    }
                    if (!data_exist) {
                      rawdataobj[paraid][timesp].push(dataobj);
                    }

                    var all_match = true;
                    var datareqobj = data.Require.toObject();
                    for (var i in datareqobj) {
                      var check = false;
                      for (var j in rawdataobj[paraid][timesp]) {
                          if (rawdataobj[paraid][timesp][j].ParameterID === datareqobj[i]) {
                            check = true;
                          }
                      }
    
                      if (!check) {
                        all_match = false;
                      }
                    }

                    if (all_match) {
                      // console.log("trigger calculation");
  
                      var equation;
                      if (data.ActiveEquation) {
                        equation = data.ActiveEquation;
                      } else if (data.Equation) {
                        equation = data.Equation;
                      } else {
                        equation = "undefined";
                      }
                      // console.log(equation);
                      _perform_calculation(rawdataobj[paraid][timesp], equation, timesp)
                        .then(
                          ret => {
                            delete rawdataobj[paraid][timesp];
                            // console.log(rawdataobj);
                            // console.log(ret);
                            if (typeof ret.Result === 'number')
                            {
                              if (isNaN(ret.Result) === false){
                                _addDataByParameterID(paraid, ret.Result, timesp, err => 
                                  {
                                    if(err) 
                                    {
                                      console.log("calculated value save error:");
                                      
                                      console.error(err);
                                    }
                                  });
                                //_addEquationHistory(paraid, ret.ResolvedEquation, ret.Result, max_timestamp);
                              }
                            }
                           
                          }
                        )
                        .catch(
                          err => {
                            parameterManage._updateParameter({ParameterID: paraid, StreamingStatus: err})
                              .then()
                              .catch(
                                err => {
                                  console.log(err);
                                }
                              )
                          }
                        )
                    }

                  } else {
                    rawdataobj[paraid][timesp] = [];
                    rawdataobj[paraid][timesp].push(dataobj)
                  }

                } else {
                  rawdataobj[paraid] = {};
                  rawdataobj[paraid][timesp] = [];
                  rawdataobj[paraid][timesp].push(dataobj);

                }
                // console.log(JSON.stringify(rawdataobj,null,2));


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
        
        // var timerange;
        // if (data.DataAvailableTimeRange)
        // {
        //   timerange = data.DataAvailableTimeRange; 
        // }
        // else {
        //   timerange = [];
        // }


        var rem = parseInt(timestamp / 1000) % 3600;

        var hour_data = parseInt(timestamp / 1000) - rem;
        
        if (data.DataAvailableTimeRange.includes(hour_data * 1000) === false)
        {
          data.DataAvailableTimeRange.push(hour_data * 1000);
        }
        
        
        data.save();
        // console.log(hour_data);
       
        // console.log(timerange);
        

        // console.log(data);
        
        

        // data.DataAvailableTimeRange = timerange;

        // data.save();
      }
    }
  });

}

function _addEquationHistory(paraID, eqn, result, ts) {
  Parameter.findOne({ParameterID: paraID}, function(err, data){
    var history = {};
    history.ResolvedEquation = eqn;
    history.TimeStamp = ts;
    history.Result = result;

    if (data.CalculationHistory.length < 20) {
      data.CalculationHistory.push(history);
    } else {
      data.CalculationHistory.shift();
      data.CalculationHistory.push(history);
    }
    data.save();
  });
}

function _addDataByParameterIDNoTrigger(paraID, value, timestamp) {
  return new Promise(
    (resolve, reject) => {
      let data = new Data(); 
      data.ParameterID = paraID;
      data.Value = value;
      data.TimeStamp = timestamp;

      var dataobj = {
        ParameterID: paraID,
        Value: value,
        TimeStamp: timestamp
      };

      data.save(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
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
    if (err)
    {
      callback(err);
    } else {
      trigger_all_parameters(dataobj);
      _update_status(paraID, timestamp, value);
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
      if (data)
      {
        Promise.all(data.Parameters.map(_getParameter))
        .then(ret => {
          callback(null, ret);
        })
        .catch(err => {
          callback(err, null);
        });
      } else {
        callback('No device match serial number', null);
      }

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
              if (data)
              {
                if (data.Parameters) {
                  Promise.all(data.Parameters.map(_getParameter))
                    .then(ret => {
                      resolve(ret);
                    })
                    .catch(err => {
                      reject(err);
                    });
                } else {
                  resolve([]);
                }
              } else {
                resolve([]);
              }


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
              if (data)
              {
                if (data.Devices) {
                  resolve(data.Devices);
                } else {
                  resolve([]);
                }
              } else {
                resolve([]);
              }
              

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

function _getRawDataByType(deviceobj, sTS, eTS) {
    return new Promise(
      (resolve, reject) => {
          var para;
          Promise.all(deviceobj.Parameters.map(_getParameter))
            .then(
              ret => {
                return Promise.all(ret.map(item => _getDataByParameterIDWithParaInfo(item, sTS, eTS)));
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
                    dev.Parameters = data;
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

function _getDataByParameterTag(assetid, tag, sTS, eTS) {
  return new Promise(
    (resolve, reject) => {
      var para;
      _getAllParameterByAssetID(assetid)
        .then(
          ret => {
            para = ret;
            var paralist = para.filter(item => item.Tag === tag);
            
            return _getDataByParameterIDWithParaInfo(paralist[0], sTS, eTS);
          }
        )
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
  });
  
}

function _getRawDataByTag(assetid, tag, sTS, eTS) {
  return new Promise(
    (resolve, reject) => {
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
            return Promise.all(devicelist.map(item => _getRawDataByType(item, sTS, eTS)));
          }
        )
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
    });
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





function _getAllParameterByAssetID(assetid) {
  return new Promise(
    (resolve, reject) => {
      var para = [];
      _getAllParameterByAssetIDPromise(assetid)
        .then(
          data =>
          {
            para = para.concat(data);
            return _getAllDeviceByAssetID(assetid);
          })
        .then(
          devicelist => {
            return Promise.all(devicelist.map(_getAllParameterByDeviceIDPromise));
          }
        )
        .then(
          ret => {
            //para = para.concat(ret);
            //console.log(para)

            for (let i in ret) {
              for (let j in ret[i]) {
                para = para.concat(ret[i][j]);
              }
            }
            //console.log(paralist);
            return para;
          }
        )
        .then(
          ret => {
            resolve(ret);
          }
        )
        .catch(
          err => {
            reject(err);
          }
        );
    });
}

function addDataByDeviceID(req, res)  {
  var dataobj = req.body;

  if (dataobj.DeviceID && dataobj.Value && dataobj.DataType)
  {

    // find parameter id
    _getAllParameterByDeviceID(dataobj.DeviceID, function(err, data){
      if (err) {
        var msg = "Device find Error1:" + JSON.stringify(err, null, 2);
        shareUtil.SendInvalidInput(res,msg);
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

        if (dataobj.Channel) {
          data = data.filter(item => item.Channel === dataobj.Channel);
        }

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
        // create device with serial number and data type
        var msg = "Device find Error2:" + JSON.stringify(err, null, 2);
        shareUtil.SendInvalidInput(res,msg);
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

        
        if (dataobj.Channel) {
          data = data.filter(item => item.Channel === dataobj.Channel);
        }

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
          shareUtil.SendSuccessWithData(res, {message: 'No matching parameter found, No data added'});
        }
      }
    });
  } else {
    var msg = "SerialNumber or Value or DataType missing";
    shareUtil.SendInvalidInput(res, msg);
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

function _getDataByParameterIDWithParaInfo(para, sTS, eTS) {
  return new Promise(
    (resolve, reject) => {
      if (para) {
        Data.find({ParameterID: para.ParameterID, TimeStamp: {$gte: sTS, $lte: eTS}},'TimeStamp Value Valid -_id', function(err, data) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            if (data.length > 0)
            {
              try{
                var paraobj = para.toObject();
                paraobj.Data = data;
                var dataarr = data.map(item => item.Value);
                var stat = {};
                var sum = dataarr.reduce((total, p) => total + p, 0);
                var avg = sum / dataarr.length;
                var min = dataarr.reduce((min, p) => Math.min(min,p));
                var max = dataarr.reduce((max, p) => Math.max(max,p));
                var stdev = math.std(dataarr);
                stat.Count = dataarr.length;
                stat.Sum = sum;
                stat.Avg = avg;
                stat.Min = min;
                stat.Max = max;
                stat.STDEV = stdev;
                paraobj.DataStatistics = stat;
              } catch(err) {
                reject(err);
              }
              resolve(paraobj);
            } else {
              var paraobj = para.toObject();
              paraobj.Data = data;
              resolve(paraobj)
            }
  
            
          }
        });
      } else {
        reject('parameterid not exists');
      }
     
    }
  );
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
          //var msg = "SerialNumber or Value or DataType missing";
          //shareUtil.SendInvalidInput(res, msg);
          shareUtil.SendSuccessWithData(res, []);
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

  if (assetid && tag && sTS && eTS) {
    _getRawDataByTag(assetid, tag, sTS, eTS)
      .then(
        ret => {
          shareUtil.SendSuccessWithData(res, ret);
        }
      )
      .catch(
        err => {
          shareUtil.SendInternalErr(res,  "tag search error:" + JSON.stringify(err, null, 2));
        }
      );
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


function _getParameterDetailAndDataByParameterID(para, sts, ets) {
  return new Promise(
    (resolve, reject) => {
      _getParameter(para)
        .then(
          ret => {
            para = ret;
            return _getDataByParameterID(para, sts, ets);
          }
        )
        .then(
          ret1 => {
              var data_out;
              data_out = para.toObject();
              data_out.Data = ret1;
              resolve(data_out);
          }
        )
        .catch(
          err => {
            reject(err);
          }
        );
    });
}

function _getAllDataFromParameterList(deviceobj, sts, ets) {
  return new Promise(
    (resolve, reject) => {
      if (deviceobj.Parameters)
      {
        Promise.all(deviceobj.Parameters.map(item => _getParameterDetailAndDataByParameterID(item, sts, ets)))
          .then(
            ret => {
              //console.log(ret);
              var out = deviceobj.toObject();
              out.Parameters = ret;
              //console.log(out);
              resolve(out);
            }
          )
          .catch(
            err => {
              console.log(err);
              reject(err);
            }
          );
      } else {
        var out = deviceobj.toObject();
        out.Parameters = [];
        resolve(out);
      }

    });
}

function _getParameterListByAssetID(assetid) {
  return new Promise(
      (resolve, reject) => {
        Asset.findOne({AssetID: assetid}, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data.Parameters);
          }
        });
      }
  );
}

function getDataByParameterTag(req, res) {

}

function getDataByAssetID(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var sTS = req.swagger.params.StartTimeStamp.value;
  var eTS = req.swagger.params.EndTimeStamp.value;
  var gi = req.swagger.params.GroupInterval.value;
  var gm = req.swagger.params.GroupMethod.value;
  var st = req.swagger.params.StartTruncate.value;

  var grouping_interval = 60; // seconds
  var grouping_method = 0; // 0=average, 1=max, 2=min, 3=count, 4=first, 5=last
  var start_truncate = 0; // 0=no truncate, 1=truncate to whole minute

  if (gi) {
    grouping_interval = gi;
  }

  if (gm) {
    grouping_method = gm;
  }

  if (st) {
    start_truncate = st;
  }

  var new_s = 0;
  var new_e = 0;
  if (assetid && sTS && eTS) {
    // get device
    var data_out = [];
    var out_put = {};
    var paraDataList = [];
    var assetHeader = [];
    if (start_truncate == 1) {
        var tr = parseInt(sTS / 1000);
        var res = tr % 60;
        new_s = tr - res;
    } else {
      new_s = parseInt(sTS / 1000);
    }
    var new_e = parseInt(eTS / 1000);

    _getAllDeviceByAssetID(assetid)
      .then(
        devicelist => {
          return Promise.all(devicelist.map(_getDeviceInfoByDeviceID));
        }
      )
      .then(
        ret => {
          return Promise.all(ret.map(item => _getAllDataFromParameterList(item, sTS, eTS)));
        }
      )
      .then(
        ret => {
          var device_name = "";
          var para_name = "";
          var full_name = "";

          var data_grp;
          for (var i in ret) {
            device_name = ret[i].Alias;
            if (ret[i].Parameters) {
              for (var j in ret[i].Parameters) {
                if (ret[i].Parameters[j].Data.length > 0)
                {
                  para_name = ret[i].Parameters[j].DisplayName;
                  full_name = device_name;
                  var single_para_data = {};
                  var col_info = {};
                  single_para_data.DisplayName = full_name;
                  single_para_data.Data = ret[i].Parameters[j].Data;
                  single_para_data.Unit = ret[i].Parameters[j].Unit;
                  paraDataList.push(single_para_data);
                  col_info.Unit = ret[i].Parameters[j].Unit;
                  if (ret[i].Alias) {
                    col_info.Header = ret[i].Alias;
                  } else if (ret[i].Tag) {
                    col_info.Header = ret[i].Tag;
                  } else if (ret[i].DisplayName) {
                    col_info.Header = ret[i].DisplayName;
                  } else {
                    col_info.Header = "N/A";
                  }
                  assetHeader.push(col_info);
                }
              }
            }
          }
          return _getParameterListByAssetID(assetid);
        }
      )
      .then(
        ret => {
          Promise.all(ret.map(item => _getParameterDetailAndDataByParameterID(item, sTS, eTS)))
            .then(
              ret => {
                for(var i in ret) {
                  if (ret[i].Data) {
                    var single_para_data = {};
                    var col_info = {};
                    single_para_data.DisplayName = ret[i].Alias;
                    single_para_data.Data = ret[i].Data;
                    single_para_data.Unit = ret[i].Unit;
                    paraDataList.push(single_para_data);
                    col_info.Unit = ret[i].Unit;
                    if (ret[i].Alias) {
                      col_info.Header = ret[i].Alias;
                    } else if (ret[i].Tag) {
                      col_info.Header = ret[i].Tag;
                    } else if (ret[i].DisplayName) {
                      col_info.Header = ret[i].DisplayName;
                    } else {
                      col_info.Header = "N/A";
                    }
                    assetHeader.push(col_info);
                  }
                }
                // process data based on time stamp
                for(var i = new_s; i <= new_e - grouping_interval; i += grouping_interval) {
                    var single_ts_data = {};
                    single_ts_data.TimeStamp = i * 1000;
                    var single_ts_data_part = [];
                    for (var j in paraDataList) {
                      if (paraDataList[j].Data) {
                        if (paraDataList[j].Data.length > 0)
                        {
                          var sum = 0;
                          var max = paraDataList[j].Data[0].Value;
                          var min = paraDataList[j].Data[0].Value;
                          var count = 0;
                          var first = paraDataList[j].Data[0].Value;
                          var last = paraDataList[j].Data[paraDataList[j].Data.length - 1].Value;
                          var valid = false;

                          for(var k in paraDataList[j].Data) {
                            if (paraDataList[j].Data[k].TimeStamp >= i * 1000 && paraDataList[j].Data[k].TimeStamp < (i + grouping_interval) * 1000)
                            {
                              if (paraDataList[j].Data[k].Value > max) {
                                max = paraDataList[j].Data[k].Value;
                              } else if (paraDataList[j].Data[k].Value < min) {
                                min = paraDataList[j].Data[k].Value;
                              }
                              count++;
                              sum += paraDataList[j].Data[k].Value;
                              if (paraDataList[j].Data[k].Valid) {
                                valid = true;
                              }
                            }
                          }
                          if (count != 0) {
                            var single_para_data1 = {};
                            switch (grouping_method) {
                              case 0:
                                single_para_data1.Value = sum / count;
                                break;
                              case 1:
                                single_para_data1.Value = max;
                                break;
                              case 2:
                                single_para_data1.Value = min;
                                break;
                              case 3:
                                single_para_data1.Value = count;
                                break;
                              case 4:
                                single_para_data1.Value = first;
                                break;
                              case 5:
                                single_para_data1.Value = last;
                                break;
                              default:
                                single_para_data1.Value = sum / count;
                                break;
                            }
                            single_para_data1.Valid = valid;
                            single_ts_data_part.push(single_para_data1);
                          }
                        }

                      }
                    }

                    single_ts_data.Data = single_ts_data_part;
                    data_out.push(single_ts_data);
                }
                out_put.AssetData = data_out;
                out_put.AssetColumnInfo = assetHeader;
                shareUtil.SendSuccessWithData(res, out_put);
              }
            )
            .catch(
              err => {
                console.log(err);
                reject(err);
              }
            );

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

function _getDataForBaselineSelection(assetid)
{
  return new Promise(
    (resolve, reject) => {
      var timerange, config;
      const tag_list = ['ShellInlet','ShellOutlet','TubeInlet','TubeOutlet'];
      assetManage._getAssetTimeRange(assetid)
        .then(
          ret => {
            timerange = ret;
            return Promise.all(tag_list.map(item => _getRawDataByTag(assetid, item, timerange[0], timerange[timerange.length - 1])));
          }
        )
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
  });
}

function _resolve_single_para(para, raw_data, config, sTS, eTS) {


  var paralist = para.replace(/[\[\]]/g,'').split(",");
  var grpdata = [];
  //console.log(paralist);
  if (para.includes("/")) // raw data
  {
    var ptag = paralist[0].split('/')[0];
    var ptype = paralist[0].split('/')[1];
  
    for(var i in raw_data) {
      for(var j in raw_data[i])
      {
        var single_data = raw_data[i][j];
  
        if (single_data.Tag === ptag) {
          for (var k in single_data.Parameters) {
            var single_p = single_data.Parameters[k];
            if (single_p.Type === ptype) {
              for (var l in single_p.Data) {
                if (single_p.Data[l].TimeStamp >= sTS && single_p.Data[l].TimeStamp <= eTS) {
                  grpdata.push(single_p.Data[l].Value);
                }
              }
            }
          }
        }
      }
    }
    if (paralist.length === 1) {
      return grpdata;
    } else if (paralist.length > 1) {
      if (paralist[1] === "COUNT") {
        return grpdata.length;
      } else {
        return grpdata
      }
    } else {
      return grpdata;
    }
    
  } else { // calculated data
    var ptag = paralist[0];
    var single_para = config.Equations.filter(item => item.Tag === ptag);
    if (single_para.length === 1) {
      if (single_para[0].Value) {
        if (ptag.includes("COUNT") && single_para[0].Value.length > 1) {
          return single_para[0].Value[single_para[0].Value.length - 1];
        } else{
          return single_para[0].Value;
        }
        
      } else {

        return para;
      }
    } else {
      return para;
    }
  }
}

function _check_resolve(config) {

  var resolved = config.Equations.filter(item => (typeof item.Value === "number" || typeof item.Value === "object"));

  return resolved.length / config.Equations.length;

}

function _eval_engine(new_eval) {
  console.log(new_eval);
  new_eval = _math_op_convert(new_eval);
  new_eval = new_eval.replace(/[\[\]]/g,'');

  const parser = math.parser();

  parser.set('t_value', function (X, df) {
    return -jStat.studentt.inv(X/2,df);
  });
  
  parser.set('count', function (...args) {
    return args.length;
  });
  
  try {
    var result = parser.eval(new_eval);
    var ret = {};

    ret.Result = result;
    ret.ResolvedEquation = new_eval
    // console.log("result=" + result);
    return ret;
  }
  catch(err) {
    // console.log("error1:");
    // console.error(err);
    var ret = {};
    ret.Error = err;
    return ret;
  }
}

function _resolve_single_equation(equ_index, raw_data, config, sTS, eTS) {
  var eqn = config.Equations[equ_index].Equation;
  var tag = config.Equations[equ_index].Tag;

  var reg = /\[[^\]]+\]/g;

  var paralist = eqn.match(reg);

  if (tag.includes("INTERVAL"))
  {
    var new_eval = eqn;
    for(var i in paralist) {
      var ret = _resolve_single_para(paralist[i], raw_data, config, sTS, eTS);
      if (typeof ret === 'object') {
        if (Array.isArray(ret) && ret.length > 0) {
          new_eval = new_eval.replace(paralist[i], ret.join(","));
        }
      } else if (typeof ret === 'number')
      {
        new_eval = new_eval.replace(paralist[i], ret.toString());
      }
    }
    var eval_ret = _eval_engine(new_eval);

    if (eval_ret.Result) {
      config.Equations[equ_index].Value = eval_ret.Result;
    }

    

  } else { // calculate multiple values
    var value = [];
    for(var s = sTS; s < eTS; s += 60000) {
      var new_eval = eqn;
      for(var i in paralist) {
        var ret = _resolve_single_para(paralist[i], raw_data, config, s, s + 60000);
        if (typeof ret === 'object') {
          if (Array.isArray(ret) && ret.length > 0) {
            new_eval = new_eval.replace(paralist[i], ret.join(","));
          } 
        } else if (typeof ret === 'number')
        {
          new_eval = new_eval.replace(paralist[i], ret.toString());
        }
      }
      var eval_ret = _eval_engine(new_eval);

      if (eval_ret.Result) {
        value.push(eval_ret.Result);
      }
    }

    if (value.length > 0) {
      config.Equations[equ_index].Value = value;
    }
  }

}

function _parameter_recalculat(raw_data, config, baseline, sTS, eTS) {

}

function _baseline_parameter_calculate(raw_data, config, sTS, eTS) {

  var retry = 10;
  var resolve_per = 0;
  while(retry-- && resolve_per < 1) {
    for(var i in config.Equations){
      _resolve_single_equation(i, raw_data, config, sTS, eTS);
    }
    
    resolve_per = _check_resolve(config);
  }
  
  return config;

}

function testFunc(req, res) {
   
  var assetid = req.swagger.params.AssetID.value;
  //res.download('./delpayManage.js');
  //shareUtil.SendSuccess(res);
 var raw_data, equations;
  _getDataForBaselineSelection(assetid)
    .then(
      ret => {
        raw_data = ret;
        return assetManage._getAssetConfig(assetid);
      }
    ).then(
      ret => {
        equations = ret;
        _baseline_parameter_calculate(raw_data, equations, 1558720065114, 1558720125114);
        shareUtil.SendSuccessWithData(res, equations);
      }
    )
  

}

function getDataForBaselineSelection(req, res) {
  var assetid = req.swagger.params.AssetID.value;
  var timerange, config;
  var tag_list = ['SHELLINLET_TMU:INTERVAL','SHELLOUTLET_TMU:INTERVAL'];
  var new_tag_list = [];

  assetManage._getAssetConfig(assetid)
    .then(
      ret => {
        config = ret;
        for(var i in tag_list) {
          for(var j in config.TimeInterval)
          {
            var new_string = tag_list[i].replace("INTERVAL", config.TimeInterval[j].toString());
            new_tag_list.push(new_string);
          }
         
        }
        //shareUtil.SendSuccessWithData(res, new_tag_list);

        return assetManage._getAssetTimeRange(assetid);
      }
    )
    .then(
      ret => {
        timerange = ret;
        if (timerange.length === 0)
        {
          return [];
        } else {
          return Promise.all(new_tag_list.map(item => _getDataByParameterTag(assetid, item, timerange[0], timerange[timerange.length - 1] + 3600000)));
        }

        
      }
    )
    .then(
      ret => {
        shareUtil.SendSuccessWithData(res, ret);
      }
    )

  // assetManage._getAssetTimeRange(assetid)
  //   .then(
  //     ret => {
  //       timerange = ret;
  //       return Promise.all(tag_list.map(item => _getRawDataByTag(assetid, item, timerange[0], timerange[timerange.length - 1])));
  //     }
  //   )
  //   .then(
  //     ret => {
  //       shareUtil.SendSuccessWithData(res, ret);
  //     }
  //   )

}

function getCalculatedDataForBaseline(req, res) {
  var assetid  = req.swagger.params.AssetID.value;
  var sTS  = req.swagger.params.StartTimeStamp.value;
  var eTS  = req.swagger.params.EndTimeStamp.value;
  var raw_data, config;
  if (assetid && sTS && eTS) {
    _getDataForBaselineSelection(assetid)
    .then(
      ret => {
        raw_data = ret;
        return assetManage._getAssetConfig(assetid);
      }
    ).then(
      ret => {
        config = ret;

        _baseline_parameter_calculate(raw_data, config, sTS, eTS);
        shareUtil.SendSuccessWithData(res, config);
      }
    )

  } else {
    shareUtil.SendInvalidInput(res, "assetid or start time stamp or end time stamp missing");
  }
}

function _deleteCalculatedData(assetid) {
  return new Promise(
    (resolve, reject) => {
      _getAllParameterByAssetIDPromise(assetid)
      .then(
        ret => {
          return Promise.all(ret.map(_deleteAllData));
        }
      )
      .then(
        ret => {
          resolve();
        }
      )
      .catch(
        err => {
          reject(err);
        }
      )
  });
}

function _update_single_equation(paralist, single_equation, timestamp) {
  return new Promise(
    (resolve, reject) => {
      var eqn = paralist.filter(item => item.Tag === single_equation);

      if (eqn.length === 1) {
        if (eqn[0].Value)  
        {
          if (isArray(eqn[0].Value))
          {

          } else {
            _addDataByParameterIDNoTrigger(eqn[0].ParameterID, eqn[0].Value, timestamp);
          }
          
        } else {
          resolve();
        }
        
      } else {
        resolve();
      }
  });

}

function _recalculate_one_data_set(raw_data, config, currentT) {
  return new Promise(
    (resolve, reject) => {
      var instant_data = JSON.parse(JSON.stringify(config));
  
      _baseline_parameter_calculate(raw_data, instant_data, currentT - 60000, currentT);
    
      Promise.all(instant_data.Equations.map(_update_single_equation))
        .then(
          ret => {
            resolve();
          }
        )
        .catch(
          err => {
            reject(err);
          }
        )
    
      // for(var i in config.TimeInterval) {
      //   var interval_data = JSON.parse(JSON.stringify(config));
      //   _baseline_parameter_calculate(raw_data, interval_data, currentT - config.TimeInterval[i], currentT);
        
      // }
  });
  

  
}

function _recalculateAsset(assetid, prev_config, config) {
  return new Promise(
    (resolve, reject) => {
      var raw_data, time_range, interval;
      var sTS, eTS;

      _deleteCalculatedData(assetid)
      .then(
        ret => {
          console.log("delete all calculated data done");
          return _getDataForBaselineSelection(assetid);
        }
      )
      .then(
        ret => {
          // start calculation
          raw_data = ret;
          return assetManage._getAssetTimeRange(assetid);
        }
      )
      .then(
        ret => {
          time_range = ret;
          if (time_range.length === 0)
          {
            console.log("no raw data to calculate");
            resolve();
          } else {
            sTS = time_range[0] + 60000;
            eTS = time_range[time_range.length - 1] + 3600000;

            _recalculate_one_data_set(raw_data, config, 1558720485080);            
            // for(var t = sTS; t < eTS; t += 60000) {
            //   _recalculate_one_data_set(t);
            // }
            resolve(config);
          }
          
          
        }
      )
  });

}
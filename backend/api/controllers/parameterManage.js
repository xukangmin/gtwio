//'use strict';

var shareUtil = require('./shareUtil.js');
const Data = require('../db/data.js');
const Device = require('../db/device.js');
const Parameter = require('../db/parameter.js');
const Asset = require('../db/asset.js');
var dataManage = require('./dataManage.js');
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
  updateRequireList: updateRequireList,
  _createEquation: _createEquation,
  updateRequireListByEquation: updateRequireListByEquation,
  _getAllParameterByDeviceIDPromise: _getAllParameterByDeviceIDPromise,
  _createParameter: _createParameter,
  _updateRequireListByEquation: _updateRequireListByEquation
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function _remove_duplicates(arr) {
    let s = new Set(arr);
    let it = s.values();
    return Array.from(it);
}

function _getTagList(equation) {
  var taglist = [];

  var reg = /\[[^\]]+\]/g;

  if(equation.match(reg)){
    taglist = equation.match(reg);
  }

  if (taglist.length > 0) {
      taglist = taglist.map(item => item.replace(/[\[\]]/g,'').split(',')[0]);
  }

  return taglist;
}

function _getFullTagList(equation) {
  var taglist = [];

  var reg = /\[[^\]]+\]/g;

  if(equation.match(reg)){
    taglist = equation.match(reg);
  }

  return taglist;
}

function _resolveSingleTagInAsset(assetid, paralist, tag) {
  return new Promise(
    (resolve, reject) => {

        var filterlist = paralist.filter(item => item.Tag === tag);

        if (filterlist.length === 0) {
          // create parameter with tag
          var paraobj = {
            Tag: tag
          };
          console.log("tag not exist in resolve, create one");
          _createParameter(null, assetid, paraobj, null)
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
        } else if (filterlist.length === 1) {
          resolve(filterlist[0].ParameterID);
        } else {
          var paraout = [];

          for (var i in filterlist) {
            paraout.push(filterlist[i].ParameterID);
          }
          resolve(paraout);
        }
    });
}

function _replaceEquation(originalEquation, taglist, newlist) {
  var new_equation = originalEquation;
  var fulllist = _getFullTagList(originalEquation);
  if (taglist.length === newlist.length)
  {
    for(var i in taglist) {
      var singleout = "";
      var singlePara = fulllist[i]; // [ShellInlet/Temperature,0,0,0]

      if (typeof newlist[i] === 'array')
      {
        for(var j in newlist[i]) {
          singleout += singlePara.replace(taglist[i], newlist[i][j]) + ",";
        }
        singleout = singleout.substring(0,singleout.length - 1);

      } else if (typeof newlist[i] === 'string') {
        singleout = singlePara.replace(taglist[i], newlist[i]);
      }
      console.log("singleout=" + singleout);
      console.log("fulllist[i]=" + fulllist[i]);
      console.log("new_equation=" + new_equation);

      fulllist[i] = fulllist[i].replace('[','\\[');
      fulllist[i] = fulllist[i].replace(']','\\]');

      var re = new RegExp(fulllist[i], 'g');
      new_equation = new_equation.replace(re, singleout);
    }
  } else {
    console.log("length not match, something weired happened");
    new_equation = originalEquation;
  }
  console.log("new equation=" + new_equation);
  return new_equation;
}

function _createEquation(assetid, paraobj) {
  return new Promise(
    (resolve, reject) => {
      if (paraobj.Name && paraobj.Equation && paraobj.Tag) {
        var taglist = _getTagList(paraobj.Equation);
        taglist = _remove_duplicates(taglist);
        console.log(taglist);
        dataManage._getAllParameterByAssetID(assetid)
          .then(
            paralist => {
              Promise.all(taglist.map(item => _resolveSingleTagInAsset(assetid, paralist, item)))
                .then(
                  ret => {
                    console.log(ret);
                    paraobj.Equation = _replaceEquation(paraobj.Equation, taglist, ret);
                    var filter_para = paralist.filter(item => item.Tag === paraobj.Tag);
                    if (filter_para.length === 1) {
                      // para already exist, update equation and name
                      paraobj.ParameterID = filter_para[0].ParameterID;
                      console.log("para exists");
                      console.log(paraobj);
                      return _updateParameter(paraobj);
                    } else if (filter_para.length === 0) {
                      console.log("para not exists");
                      console.log("para not exists, create para");
                      return _createParameter(null, assetid, paraobj, null);
                    } else {
                      // more than one para with same Tag exists
                      console.log("more than 1 para exists");
                      reject(new Error('More than 1 para exists'));
                    }
                  }
                )
                .then(
                  ret1 => {
                    console.log(ret1);
                    resolve();
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
          )
      } else {
        resolve();
      }
    });
}

function _createParameter(deviceid, assetid, paraobj, devicetag) {
    return new Promise(
      (resolve, reject) => {
        const shortid = require('shortid');

        if (typeof paraobj === 'undefined') {
          reject(new Error('Parameter object not defined'));
        } else {
          let para = new Parameter();

          if (typeof paraobj === 'string') {
            // single string, treat as parameter type
            para.Type = paraobj;
          } else if (typeof paraobj === 'object') {
            for (var key in paraobj) {
              para[key] = paraobj[key];
            }
          }

          if (devicetag) {
            para.Tag = devicetag + "/" + para.Type;
          }

          para.ParameterID = "P" + shortid.generate();
          para.CurrentValue = 0;

          para.save(err => {
            if (err)
            {
              reject(err);
            }
            else {
              // add to devices
              if (deviceid) {
                Device.findOneAndUpdate({DeviceID: deviceid},
                            {
                              $push: {
                                Parameters:  {ParameterID: para.ParameterID}
                              }
                            },
                            function(err,data) {
                              if (err) {
                                reject(err);
                              } else {
                                if (paraobj.Equation) { // update equation
                                  _updateRequireListByEquation(para.ParameterID, paraobj.Equation, function(err,data) {
                                    if (err) {
                                      var msg = "Error _updateRequireListByEquation:" +  JSON.stringify(err, null, 2);
                                      console.error(msg);
                                      resolve(para.ParameterID);
                                    } else {
                                      resolve(para.ParameterID);
                                    }
                                  });
                                } else {
                                  resolve(para.ParameterID);
                                }
                              }
                            });
              } else if (assetid) { // add to asset only
                  Asset.findOneAndUpdate({AssetID: assetid},
                            {
                                $push: {
                                  Parameters:  {ParameterID: para.ParameterID}
                                }
                            },
                            function(err,data){
                              if (err)
                              {
                                reject(err);
                              }
                              else {
                                if (paraobj.Equation) { // update equation
                                  _updateRequireListByEquation(para.ParameterID, paraobj.Equation, function(err,data) {
                                    if (err) {
                                      var msg = "Error _updateRequireListByEquation:" +  JSON.stringify(err, null, 2);
                                      console.error(msg);
                                      resolve(para.ParameterID);
                                    } else {
                                      resolve(para.ParameterID);
                                    }
                                  });
                                } else {
                                  resolve(para.ParameterID);
                                }
                              }
                            }
                          );
              }




            }

          });
        }
      });
}

function createParameter(req, res) {
  var paraobj = req.body;

  _createParameter(paraobj.DeviceID, paraobj.AssetID, paraobj, null)
    .then(
      ret => {
        shareUtil.SendSuccess(res);
        //console.log(data);
      }
    )
    .catch(
      err => {
        var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res, msg);
      }
    );

}

function _updateParameter(paraobj) {
  return new Promise(
    (resolve, reject) => {
      Parameter.findOneAndUpdate({ParameterID: paraobj.ParameterID}, paraobj, function(err,data) {
        if (err) {
          reject(err);
        } else {
          if (paraobj.Equation) { // update equation
            _updateRequireListByEquation(paraobj.ParameterID, paraobj.Equation, function(err,data) {
              if (err) {
                var msg = "Error _updateRequireListByEquation:" +  JSON.stringify(err, null, 2);
                console.error(msg);
                reject(err);
              } else {
                resolve();
              }
            });
          } else {
            resolve();
          }
        }
      })
    });
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
            if (paraobj.Equation) { // update equation
              _updateRequireListByEquation(paraobj.ParameterID, paraobj.Equation, function(err,data) {
                if (err) {
                  var msg = "Error _updateRequireListByEquation:" +  JSON.stringify(err, null, 2);
                  console.error(msg);
                }
              });
            }
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

  const shortid = require('shortid');

  let para = new Parameter();

  para.ParameterID = "P" + shortid.generate();
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
                        callback(err1, null);
                      } else {
                        callback(null, para);
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
                        callback(err2, null);
                      }
                      else {
                        callback(null, para);
                      }
                    }
                  );
      }




    }

  });
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

function _getAllParameterByDeviceIDPromise(deviceid) {
  return new Promise(
    (resolve, reject) => {
      Device.findOne({DeviceID: deviceid}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          if (data) {
            Promise.all(data.Parameters.map(_getParameter))
              .then(ret => {
                let data_out = data.toObject();
                data_out.Parameters = ret;
                resolve(data_out);
              })
              .catch(err => {
                reject(err);
              });
          } else {
            resolve();
          }

        }

      });
    }
  );

}

function getParameterByAsset(req, res) {
  var assetid = req.swagger.params.AssetID.value;

  if (assetid) {
    Asset.findOne({AssetID: assetid}, function(err, data){
      if (err) {
        var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
        shareUtil.SendInternalErr(res, msg);
      } else {
        if (data)
        {
          if (data.Parameters)
          {
            Promise.all(data.Parameters.map(_getParameter))
              .then(
                ret => {
                  //console.log(ret);
                  shareUtil.SendSuccessWithData(res, ret);
                }
              )
              .catch(
                err => {
                  var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
                  shareUtil.SendInternalErr(res, msg);
                }
              )
          } else {
            shareUtil.SendSuccessWithData(res, []);
          }
        } else {
          var msg = "AssetID does not exist";
          shareUtil.SendInvalidInput(res, msg);
        }


      }
    });
  } else {
    var msg = "missing Asset ID";
    shareUtil.SendInvalidInput(res, msg);
  }
}

function getParameterbyDevice(req, res) {
  var deviceID = req.swagger.params.DeviceID.value;

  if (deviceID)
  {
    _getAllParameterByDeviceIDPromise(deviceID)
      .then(
        ret => {
          shareUtil.SendSuccessWithData(res, ret);
        }
      )
      .catch(
        err => {
          var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res, msg);
        }
      );
  } else {
    var msg = "Missing device ID";
    shareUtil.SendInvalidInput(res, msg);
  }

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

function _remove_single_parameter_require(paraid, ori_para_id){
  return new Promise(
    (resolve, reject) => {
      Parameter.findOne({ParameterID: paraid}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          if (data.RequiredBy.includes(ori_para_id)) {
            // remove paraid to required from list
            Parameter.update({ParameterID: paraid}, {
              $pull: {
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

function _updateRequireListByEquation(paraid, equation, callback) {
  var paralist = [];

  var reg = /\[[^\]]+\]/g;

  if(equation.match(reg)){
    paralist = equation.match(reg);
  }

  if (paralist.length > 0) {
      paralist = paralist.map(item => item.replace(/[\[\]]/g,'').split(',')[0]);

      _updateRequireList(paraid, paralist, callback);
  }
}

function updateRequireListByEquation(req, res) {
  var paraID = req.body.ParameterID;
  Parameter.findOne({ParameterID: paraID}, function(err, data) {
    if (data.Equation) {
      _updateRequireListByEquation(paraID, data.Equation, function(err, data) {
        if (err) {
          var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res, msg);
        } else {
          shareUtil.SendSuccess(res);
        }
      });
    } else {
      var msg = "no equation:" +  JSON.stringify(err, null, 2);
      shareUtil.SendInvalidInput(res, msg);
    }
  });

}

function _updateRequireList(paraID, requireList, callback) {
  Parameter.findOne({ParameterID: paraID}, function(err,data) {
    if (err) {
      callback(err, null);
    } else {
      var addlist = [];
      var rmlist = [];
      if (data.Require) {
        // check existence in
        for(var i in requireList) {
          var rexist = false;
          for (var j in data.Require) {
            if (requireList[i] === data.Require[j]) {
              rexist = true;
            }
          }
          if (!rexist) {
              addlist.push(requireList[i]);
          }
        }
        var old_para_list = data.Require.toObject();
        for(var i in old_para_list) {
          var rexist = false;
          for (var j in requireList) {
            if (old_para_list[i] === requireList[j]) {
              rexist = true;
            }
          }
          if (!rexist) {
              rmlist.push(old_para_list[i]);
          }
        }

      }
      else
      {
        addlist = requireList;
      }

      data.Require = requireList;

      data.save(err => {
        if (err) {
          callback(err, null);
        } else {
          Promise.all(addlist.map(item => _add_single_parameter_require(item, paraID)))
            .then(
              ret => {
                return Promise.all(rmlist.map(item => _remove_single_parameter_require(item, paraID)));

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
      });


    }
  });
}

function updateRequireList(req, res) {
  var paraID = req.body.ParameterID;
  var requireList = req.body.RequireList;

  if (paraID) {
    _updateRequireList(paraID, requireList, function(err, data) {
        if (err) {
          var msg = "Error parameter:" +  JSON.stringify(err, null, 2);
          shareUtil.SendInternalErr(res, msg);
        } else {
          shareUtil.SendSuccess(res);
        }
    });
  } else {
    var msg = "parID missing";
    shareUtil.SendInvalidInput(res, msg);
  }
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

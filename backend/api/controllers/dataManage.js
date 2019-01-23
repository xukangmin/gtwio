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

var util = require('util');
const os = require('os');


const INVALID_INPUT = "Invalid Input";
const ALREADY_EXIST = "Item Already Exist";
const SUCCESS_MSG = "Success";
const NOT_EXIST = "Item Does Not Exist";
const INTERNAL_ERR = "Internal Error";

module.exports = {
  constants: {
    INVALID_INPUT: INVALID_INPUT,
    ALREADY_EXIST: ALREADY_EXIST,
    SUCCESS_MSG: SUCCESS_MSG,
    NOT_EXIST: NOT_EXIST,
    INTERNAL_ERR: INTERNAL_ERR
  },
  SendInvalidInput: SendInvalidInput,
  SendSuccess: SendSuccess,
  SendSuccessWithData: SendSuccessWithData,
  SendInternalErr: SendInternalErr,
  SendNotFound: SendNotFound
};

function SendInvalidInput(res, msg = INVALID_INPUT) {
  var errmsg = {
    message: msg
  };
  //console.log(errmsg);
  res.status(400).send(errmsg);
}

function SendNotFound(res, msg = NOT_EXIST) {
  var errmsg = {
    message: msg
  };
  //console.log(errmsg);
  res.status(404).send(errmsg);
}

function SendSuccess(res, msg = SUCCESS_MSG) {
  var errmsg = {
    message: msg
  };
  res.status(200).send(errmsg);
}

function SendInternalErr(res, msg = INTERNAL_ERR) {
  var errmsg = {
    message: msg
  };
  console.log(errmsg);
  res.status(500).send(errmsg);
}

function SendSuccessWithData(res, data_out) {
  res.status(200).send(data_out);
}

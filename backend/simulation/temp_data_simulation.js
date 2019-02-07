const Data = require('../api/db/data.js');
const Device = require('../api/db/device.js');
const Parameter = require('../api/db/parameter.js');
const Asset = require('../api/db/asset.js');
const fetch = require('node-fetch');
const API_PORT =  require('../config/constants.js').API_PORT;
function generate_simulation_data1(paraID, lowRange, highRange) {
  let data = new Data();

  data.ParameterID = paraID;
  data.TimeStamp = Math.floor((new Date).getTime());

  data.Value = Math.random() * (highRange-lowRange) + lowRange;

  data.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
}

function generate_simulation_data(paraID, lowRange, highRange) {
  const requestOptions = {
      headers: { 'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify({
          'ParameterID': paraID,
          'Value': Math.random() * (highRange-lowRange) + lowRange,
          "TimeStamp": Math.floor((new Date).getTime())
      })
  };

  fetch('http://localhost:' + API_PORT + '/data/addDataByParameterID', requestOptions)
      .then(response => {
          return Promise.all([response, response.json()])
      })
      .then( ([resRaw, resJSON]) => {
          if (!resRaw.ok)
          {
              return Promise.reject(resJSON.message);
          }
          return resJSON;
      })
      .then(ret => {

      })
      .catch(err => {
        console.error(err);
      });
}

module.exports.simualte = (interval) => {
  function myFunc(arg) {
    // console.log(`arg was => ${arg}`);
    console.log("generate simulation data");
    generate_simulation_data('TempPara0', 60, 61);
    generate_simulation_data('TempPara1', 60, 61);
    generate_simulation_data('TempPara2', 60, 61);
    generate_simulation_data('TempPara3', 60, 61);
    generate_simulation_data('TempPara4', 75, 76);
    generate_simulation_data('TempPara5', 75, 76);
    generate_simulation_data('TempPara6', 75, 76);
    generate_simulation_data('TempPara7', 75, 76);
    generate_simulation_data('TempPara8', 90, 91);
    generate_simulation_data('TempPara9', 90, 91);
    generate_simulation_data('TempPara10', 90, 91);
    generate_simulation_data('TempPara11', 90, 91);
    generate_simulation_data('TempPara12', 80, 81);
    generate_simulation_data('TempPara13', 80, 81);
    generate_simulation_data('TempPara14', 80, 81);
    generate_simulation_data('TempPara15', 80, 81);
  }

  setInterval(myFunc, interval, 'funky');
}

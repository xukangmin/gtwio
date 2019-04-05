const Data = require('../api/db/data.js');
const Device = require('../api/db/device.js');
const Parameter = require('../api/db/parameter.js');
const Asset = require('../api/db/asset.js');
const fetch = require('node-fetch');
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

function generate_simulation_data(sn, type, lowRange, highRange) {
  const requestOptions = {
      headers: { 'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify({
          'SerialNumber': sn,
          'Value': Math.random() * (highRange-lowRange) + lowRange,
          'DataType': type
      })
  };
  
  fetch(process.env.APP_HOST + ':' + process.env.APP_PORT + '/data/addDataBySerialNumber', requestOptions)
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
        //console.error(err);
      });
}

module.exports.simualte = (interval) => {
  function myFunc(arg) {
    // console.log(`arg was => ${arg}`);
    //console.log("generate simulation data");

    for(var j = 0; j <= 32; j+= 16)
    {
      for(var i = j + 50; i <= j + 53; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", 60, 61);
      }
      for(var i = j + 54; i <= j + 57; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", 75, 76);
      }
      for(var i = j + 58; i <= j + 61; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", 90, 91);
      }
      for(var i = j + 62; i <= j + 65; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", 80, 81);
      }
    }

    generate_simulation_data('05A001', "FlowRate", 300, 350);
    generate_simulation_data('05A002', "FlowRate", 300, 350);
    generate_simulation_data('05A003', "FlowRate", 300, 350);
  }

  setInterval(myFunc, interval, 'funky');
}

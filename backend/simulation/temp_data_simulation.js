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
  
  

//    fetch(process.env.CLOUD_HOST + '/data/addDataBySerialNumber', requestOptions)
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
        generate_simulation_data('02A0' + i.toString(), "Temperature", 34.0, 34.2);
      }
      for(var i = j + 54; i <= j + 57; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", 58.0, 58.2);
      }
      for(var i = j + 58; i <= j + 61; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", 125.0, 125.2);
      }
      for(var i = j + 62; i <= j + 65; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", 88.0, 88.2);
      }
    }

    generate_simulation_data('05A001', "FlowRate", 85.0, 85.2);
    generate_simulation_data('05A002', "FlowRate", 85.0, 85.2);
    generate_simulation_data('05A003', "FlowRate", 55.0, 55.2);

    generate_simulation_data('02A007', "Temperature", 88.0, 88.2);
    generate_simulation_data('02A008', "Temperature", 81.0, 83.2);
    generate_simulation_data('02A009', "Temperature", 83.0, 84.2);
    generate_simulation_data('02A010', "Temperature", 85.0, 86.2);

    generate_simulation_data('03A01A', "Temperature", 88.0, 88.2);
    generate_simulation_data('03A01B', "Temperature", 81.0, 83.2);
    generate_simulation_data('03A01C', "Temperature", 83.0, 84.2);
    generate_simulation_data('03A01D', "Temperature", 85.0, 86.2);

    generate_simulation_data('04A001', "Temperature", 88.0, 88.2);
    generate_simulation_data('04A002', "Temperature", 81.0, 83.2);
    generate_simulation_data('04A003', "Temperature", 83.0, 84.2);
    generate_simulation_data('04A004', "Temperature", 85.0, 86.2);

    generate_simulation_data('04A001', "Humidity", 38.0, 38.2);
    generate_simulation_data('04A002', "Humidity", 31.0, 33.2);
    generate_simulation_data('04A003', "Humidity", 33.0, 34.2);
    generate_simulation_data('04A004', "Humidity", 35.0, 36.2);
  }

  setInterval(myFunc, interval, 'funky');
}

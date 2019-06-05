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

function generate_simulation_data(sn, type, ch, lowRange, highRange) {

  var cus_body;



  if (ch) {
    cus_body = {
      'SerialNumber': sn,
      'Value': Math.random() * (highRange-lowRange) + lowRange,
      'DataType': type,
      'Channel': ch
    };
  } else {
    cus_body = {
      'SerialNumber': sn,
      'Value': Math.random() * (highRange-lowRange) + lowRange,
      'DataType': type
    };
  }

  const requestOptions = {
    headers: { 'Content-Type': 'application/json'},
    method: 'POST',
    body: JSON.stringify(cus_body)
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
        generate_simulation_data('02A0' + i.toString(), "Temperature", null, 34.0, 34.2);
      }
      for(var i = j + 54; i <= j + 57; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", null, 58.0, 58.2);
      }
      for(var i = j + 58; i <= j + 61; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", null, 125.0, 125.2);
      }
      for(var i = j + 62; i <= j + 65; i++) {
        generate_simulation_data('02A0' + i.toString(), "Temperature", null, 88.0, 88.2);
      }
    }

    generate_simulation_data('05A001', "FlowRate", null, 85.0, 85.2);
    generate_simulation_data('05A002', "FlowRate", null, 85.0, 85.2);
    generate_simulation_data('05A003', "FlowRate", null, 55.0, 55.2);

    generate_simulation_data('02A007', "Temperature", null, 88.0, 88.2);
    generate_simulation_data('02A008', "Temperature", null, 81.0, 83.2);
    generate_simulation_data('02A009', "Temperature", null, 83.0, 84.2);
    generate_simulation_data('02A010', "Temperature", null, 85.0, 86.2);

    generate_simulation_data('03A001', "Temperature", "a", 88.0, 88.2);
    generate_simulation_data('03A001', "Temperature", "b", 81.0, 83.2);
    generate_simulation_data('03A001', "Temperature", "c", 83.0, 84.2);
    generate_simulation_data('03A001', "Temperature", "d", 85.0, 86.2);

    generate_simulation_data('08A002', "Temperature", null, 88.0, 88.2);
    generate_simulation_data('08A003', "Temperature", null, 81.0, 83.2);
    generate_simulation_data('08A004', "Temperature", null, 83.0, 84.2);
    generate_simulation_data('08A005', "Temperature", null, 85.0, 86.2);

    generate_simulation_data('08A002', "Humidity", null, 38.0, 38.2);
    generate_simulation_data('08A003', "Humidity", null, 31.0, 33.2);
    generate_simulation_data('08A004', "Humidity", null, 33.0, 34.2);
    generate_simulation_data('08A005', "Humidity", null, 35.0, 36.2);
  }

  setInterval(myFunc, interval, 'funky');
}

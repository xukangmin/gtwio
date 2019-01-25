const Data = require('../api/db/data.js');
const Device = require('../api/db/device.js');
const Parameter = require('../api/db/parameter.js');
const Asset = require('../api/db/asset.js');

function generate_simulation_data(paraID, lowRange, highRange) {
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

module.exports.simualte = (interval) => {
  function myFunc(arg) {
    // console.log(`arg was => ${arg}`);
    console.log("generate simulation data");
    generate_simulation_data('TempPara0', 60, 70);
    generate_simulation_data('TempPara1', 60, 70);
    generate_simulation_data('TempPara2', 60, 70);
    generate_simulation_data('TempPara3', 60, 70);
    generate_simulation_data('TempPara4', 75, 80);
    generate_simulation_data('TempPara5', 75, 80);
    generate_simulation_data('TempPara6', 75, 80);
    generate_simulation_data('TempPara7', 75, 80);
    generate_simulation_data('TempPara8', 90, 95);
    generate_simulation_data('TempPara9', 90, 95);
    generate_simulation_data('TempPara10', 90, 95);
    generate_simulation_data('TempPara11', 90, 95);
    generate_simulation_data('TempPara12', 80, 85);
    generate_simulation_data('TempPara13', 80, 85);
    generate_simulation_data('TempPara14', 80, 85);
    generate_simulation_data('TempPara15', 80, 85);

  }

  setInterval(myFunc, interval, 'funky');
}

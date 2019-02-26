const Data = require('../api/db/data.js');
const Device = require('../api/db/device.js');
const Parameter = require('../api/db/parameter.js');

module.exports.selfcheck = (interval) => {
  function myFunc(arg) {
    // console.log(`arg was => ${arg}`);
    console.log("self_check");
    // check all device & parameter status
    Parameter.find({},function(err, data){
      data.forEach(singlePara => {
        var currentTime = (new Date).getTime();

        if (!singlePara.Timeout)
        {
          singlePara.Timeout = 600;
        }

        if (currentTime - singlePara.CurrentTimeStamp <= singlePara.Timeout * 1000) {
          singlePara.StreamingStatus = "Active";
        } else {
          singlePara.StreamingStatus = "Stopped";
        }
        singlePara.save();
      })
    });
  }

  setInterval(myFunc, interval, 'funky');
}

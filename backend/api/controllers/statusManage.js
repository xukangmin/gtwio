var shareUtil = require('./shareUtil.js');
const checkDiskSpace = require('check-disk-space')
const os = require('os');

let gPath = os.platform() === 'win32' ? 'C:/' : '/';



var functions = {
    getCurrentStatus: getCurrentStatus
  }
  
for (var key in functions) {
    module.exports[key] = functions[key];
}


function getCurrentStatus(req, res){
    var ret = {};

    ret.ServerTime = new Date().toString();



    checkDiskSpace(gPath)
    .then(
        ret1 => {

            if (ret1.free && ret1.size)
            {
                var freeGB = ret1.free / 1024 / 1024 / 1024;
                ret.FreeSpace = freeGB.toFixed(2) + " GB";

                var totalGB = ret1.size / 1024 / 1024 / 1024;
                ret.TotalSpace = totalGB.toFixed(2) + " GB";

                var percentage = ret1.free / ret1.size * 100;
                ret.FreePercentage = percentage.toFixed(2);

            }

            shareUtil.SendSuccessWithData(res, ret);
        }
    )
    .catch(
        err => {
            console.log(err);
            shareUtil.SendSuccessWithData(res, ret);
        }
    )
    
}
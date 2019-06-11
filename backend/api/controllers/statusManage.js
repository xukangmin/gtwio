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

            if (ret1.free)
            {
                if (typeof ret1.free === 'number') {
                    var freeGB = ret1.free / 1024 / 1024 / 1024;
                    ret.FreeSpace = freeGB.toFixed(2) + " GB";
                }
            }

            if (ret1.size)
            {
                if (typeof ret1.size === 'number') {
                    var totalGB = ret1.size / 1024 / 1024 / 1024;
                    ret.TotalSpace = totalGB.toFixed(2) + " GB";
                }
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
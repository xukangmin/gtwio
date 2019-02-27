var shareUtil = require('./shareUtil.js');
var childProcess = require('child_process');

var functions = {
  productionUpdate: productionUpdate
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function productionUpdate(req, res) {
  var dataobj = req.body;
  var sender = req.body.sender;
  var branch = req.body.ref;

  if(branch.indexOf('master') > -1){
    childProcess.exec(require('path').join(__dirname, '../../deploy/deploy.sh'), function(err, stdout, stderr){
        if (err) {
         console.error(err);
         shareUtil.SendInternalErr(res, err);
       } else {
         shareUtil.SendSuccess(res);
       }

      });
  } else {
    shareUtil.SendSuccessWithData(res, {Note: 'Nothing updated'});
  }



}


function deploy(res){

}

var shareUtil = require('./shareUtil.js');

var functions = {
  productionUpdate: productionUpdate
}

for (var key in functions) {
  module.exports[key] = functions[key];
}

function productionUpdate(req, res) {
  var dataobj = req.body;
  console.log(dataobj);
  shareUtil.SendSuccess(res);

}

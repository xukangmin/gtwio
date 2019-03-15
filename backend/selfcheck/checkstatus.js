const Data = require('../api/db/data.js');
const Device = require('../api/db/device.js');
const Parameter = require('../api/db/parameter.js');
const parameterManage = require('../api/controllers/parameterManage.js');

function remove_duplicates(arr) {
    let s = new Set(arr);
    let it = s.values();
    return Array.from(it);
}

function _getRequireListByEquation(equation) {
  var paralist = [];

  var reg = /\[[^\]]+\]/g;

  if(equation.match(reg)){
    paralist = equation.match(reg);
  }

  if (paralist.length > 0) {
      paralist = paralist.map(item => item.replace(/[\[\]]/g,'').split(',')[0]);
  }

  return remove_duplicates(paralist);
}

function _checkStatus(paraid) {
  return new Promise(
    (resolve, reject) => {
      Parameter.find({ParameterID: paraid}, function(err, data) {
        if (err) {
          reject(err);
        } else {
          if (data.length === 1)
          {
            if (data[0].StreamingStatus) {
              if (data[0].StreamingStatus == "Active") {
                resolve(true);
              } else {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }

        }
      });
    });

}

module.exports.selfcheck = (interval) => {
  function myFunc(arg) {
    // console.log(`arg was => ${arg}`);
    //console.log("self_check");
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

        // check equation requirement satisfied
        if (singlePara.Equation) {
          //console.log("checking  para=" + singlePara.ParameterID);
          var paralist = _getRequireListByEquation(singlePara.Equation);

          Promise.all(paralist.map(_checkStatus))
            .then(
              ret => {
                var inactive = [];
                for(var i in ret) {
                  if (ret[i] == false) {
                    inactive.push(paralist[i]);
                  }
                }
                if (inactive.length > 0 && inactive.length != paralist.length)
                {
                  // adjust statistic part of equation if possible
                  var reg = /(avg|mean|std|max|min|median|sum)\([^\(^\)]+\)/ig;
                  //console.log(singlePara.Equation);
                  var mlist = singlePara.Equation.match(reg);
                  if (mlist) {
                    var new_equation = singlePara.Equation;
                    for(var i  in mlist) {
                      //replace one by one in Equation
                      var eq_part = mlist[i];
                      for(var j in inactive) {
                        if (eq_part.includes(inactive[j])) {
                          var re1 = new RegExp('\\[' + inactive[j] + '[^\\]]*\\],','g');
                          var re2 = new RegExp(',\\[' + inactive[j] + '[^\\]]*\\]','g');
                          eq_part = eq_part.replace(re1,"");
                          eq_part = eq_part.replace(re2,"");
                        }
                      }
                      new_equation = new_equation.replace(mlist[i], eq_part);
                    }

                    // update new equation and require list
                    if (singlePara.ActiveEquation != new_equation)
                    {
                      // update new equaiton
                      console.log("update new equation=" + new_equation);
                      //console.log(mlist);
                      singlePara.ActiveEquation = new_equation;
                      parameterManage._updateRequireListByEquation(singlePara.ParameterID, new_equation, function(err,data) {
                        if (err) {
                          console.error(err);
                        } else {
                          singlePara.save();
                        }
                      });

                    }

                  }

                } else {
                  // restore original equaiton
                  if (singlePara.ActiveEquation) {
                    if (singlePara.Equation != singlePara.ActiveEquation) {
                      console.log("restore original equation=" + singlePara.Equation);
                       singlePara.ActiveEquation = singlePara.Equation;
                      parameterManage._updateRequireListByEquation(singlePara.ParameterID, singlePara.Equation, function(err,data) {
                        if (err) {
                          console.error(err);
                        } else {
                          singlePara.save();
                        }
                      });
                    }
                  }

                }
              }
            )
            .catch(
              err => {
                console.error(err);
              }
            );
        }
        singlePara.save();
      })
    });
  }

  setInterval(myFunc, interval, 'funky');
}

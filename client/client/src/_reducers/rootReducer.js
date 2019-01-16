import { combineReducers } from 'redux'

import { login } from './loginReducer'
import { alert } from './alertReducer'
import { reg } from './regReducer'
import { reset } from './resetReducer'
import { data } from './dataReducer'
import { device } from './deviceReducer'
import { variable } from './variableReducer'
import { parameter } from './parameterReducer'
import { asset } from './assetReducer'
import { dashboard } from './dashboardReducer'

const rootReducer = combineReducers({
  reg,
  login,
  alert,
  reset,
  data,
  device,
  variable,
  parameter,
  asset,
  dashboard
});

export default rootReducer;

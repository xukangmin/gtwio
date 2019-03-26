import { gConstants } from '../Constants/constants';

export const dashboard = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_DASHBOARD_REQUEST:
        return {
            gettingDashboard: true
        };
    case gConstants.GET_DASHBOARD_SUCCESS:
        return {
            gotDashboard: true,
            data: action.data
        };
    case gConstants.GET_DASHBOARD_FAILURE:
        return {
            error: action.error
        };
    case gConstants.ADD_DASHBOARD_REQEUST:
        return state;
    case gConstants.ADD_DASHBOARD_SUCCESS:
        return state;
    case gConstants.ADD_DASHBOARD_FAILURE:
        return state;
    case gConstants.UPDATE_DASHBOARD_REQEUST:
        return state;
    case gConstants.UPDATE_DASHBOARD_SUCCESS:
        return state;
    case gConstants.UPDATE_DASHBOARD_FAILURE:
        return state;
    case gConstants.DELETE_DASHBOARD_REQEUST:
        return state;
    case gConstants.DELETE_DASHBOARD_SUCCESS:
        return state;
    case gConstants.DELETE_DASHBOARD_FAILURE:
        return state;
    default:
        return state;
  }
}

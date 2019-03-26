import { gConstants } from '../Constants/constants';

export const device = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_DEVICES_REQUEST:
        return {
            ...state,
            gettingDEVICE: true
        };
    case gConstants.GET_DEVICES_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_DEVICES_FAILURE:
        return {
            error: action.error,
            data: {Items: [], Count: 0}
        };
    case gConstants.GET_DEVICE_REQUEST:
        return {
            ...state,
            gettingDEVICE: true
        };
    case gConstants.GET_DEVICE_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_DEVICE_FAILURE:
        return {
            error: action.error,
            data: {Items: [], Count: 0}
        };
    case gConstants.ADD_DEVICE_REQEUST:
        return state;
    case gConstants.ADD_DEVICE_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_DEVICE_FAILURE:
        return {
            ...state,
            error: action.error
        };
    default:
        return state;
  }
}

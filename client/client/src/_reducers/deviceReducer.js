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
            ...state,
            gotData: true,
            all: action.data
        };
    case gConstants.GET_DEVICES_FAILURE:
        return {
            error: action.error,
            all: {Items: [], Count: 0}
        };
    case gConstants.GET_DEVICE_REQUEST:
        return {
            ...state,
            gettingDEVICE: true
        };
    case gConstants.GET_DEVICE_SUCCESS:
        return {
            ...state,
            gotData: true,
            // single: action.data
        };

    case gConstants.GET_DEVICE_BY_SN_FAILURE:
        return {
            error: action.error,
            single: {Items: [], Count: 0}
        };

        case gConstants.GET_DEVICE_BY_SN_REQUEST:
        return {
            ...state,
            gettingDEVICE: true
        };
    case gConstants.GET_DEVICE_BY_SN_SUCCESS:
        return {
            ...state,
            gotData: true,
            single: action.data
        };
    case gConstants.GET_DEVICE_FAILURE:
        return {
            error: action.error,
            single: {Items: [], Count: 0}
        };

    case gConstants.ADD_DEVICE_REQUEST:
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

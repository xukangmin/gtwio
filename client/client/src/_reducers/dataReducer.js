import { gConstants } from '../Constants/constants';

export const data = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_DATA_REQUEST:
        return {
            gettingData: true
        };
    case gConstants.GET_DATA_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_DATA_FAILURE:
        return {
            error: action.error
        };
    case gConstants.GET_TAG_DATA_REQUEST:
        return {
            gettingData: true
        };
    case gConstants.GET_TAG_DATA_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_TAG_DATA_FAILURE:
        return {
            error: action.error
        };
    case gConstants.GET_PARAMETER_DATA_REQUEST:
        return {
            gettingData: true
        };
    case gConstants.GET_PARAMETER_DATA_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_PARAMETER_DATA_FAILURE:
        return {
            error: action.error
        };
    case gConstants.GET_ASSET_DATA_REQUEST:
        return {
            gettingData: true
        };
    case gConstants.GET_ASSET_DATA_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_ASSET_DATA_FAILURE:
        return {
            error: action.error
        };
    case gConstants.GET_SERIAL_NUMBER_DATA_REQUEST:
        return {
            gettingData: true
        };
    case gConstants.GET_SERIAL_NUMBER_DATA_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_SERIAL_NUMBER_DATA_FAILURE:
        return {
            error: action.error
        };
    case gConstants.ADD_DATA_REQUEST:
        return state;
    case gConstants.ADD_DATA_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_DATA_FAILURE:
        return {
            error: action.error
        };
    default:
        return state;
  }
}

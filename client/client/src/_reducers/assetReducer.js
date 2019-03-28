import { gConstants } from '../Constants/constants';

export const asset = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_ASSETS_REQUEST:
    return {
        ...state,
        gettingAsset: true
    };
    case gConstants.GET_ASSETS_SUCCESS:
    return {
        gotData: true,
        data: action.data
    };
    case gConstants.GET_ASSET_REQUEST:
        return {
            ...state,
            gettingAsset: true
        };
    case gConstants.GET_ASSET_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_ASSET_TAG_SUCCESS:
        return {
          ...state,
          gotData: true,
          tags: action.data
        };
    case gConstants.GET_ASSET_FAILURE:
        return {
            error: action.error
        };
    case gConstants.GET_DEVICES_BY_ASSET_REQUEST:
        return {
            ...state,
            gettingAsset: true
        };
    case gConstants.GET_DEVICES_BY_ASSET_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.ADD_ASSET_REQUEST:
        return state;
    case gConstants.ADD_ASSET_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_ASSET_FAILURE:
        return {
            error: action.error
        };
    case gConstants.ADD_ASSET_BY_CONFIG_REQUeST:
        return state;
    case gConstants.ADD_ASSET_BY_CONFIG_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_ASSET_BY_CONFIG_FAILURE:
        return {
            error: action.error
        };
    case gConstants.ADD_ASSET_BY_CONFIG_FILE_REQUeST:
        return state;
    case gConstants.ADD_ASSET_BY_CONFIG_FILE_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_ASSET_BY_CONFIG_FILE_FAILURE:
        return {
            error: action.error
        };
    default:
        return state;
  }
}

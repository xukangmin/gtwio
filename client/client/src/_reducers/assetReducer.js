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
    case gConstants.GET_ASSETS_FAILURE:
        return {
            ...state,
            error: action.error
        };
    //
    case gConstants.GET_ASSET_REQUEST:
        return {
            ...state,
            gettingAsset: true
        };
    case gConstants.GET_ASSET_SUCCESS:
        return {
            ...state,
            gotData: true,
            data: action.data
        };
    case gConstants.GET_ASSET_FAILURE:
        return {
            ...state,
            error: action.error
        };
    //
    case gConstants.GET_ASSET_CONFIG_REQUEST:
        return {
            ...state,
            gettingAssetConfig: true
        };
    case gConstants.GET_ASSET_CONFIG_SUCCESS:
        return {
            ...state,
            gotData: true,
            config: action.data
        };
    case gConstants.GET_ASSET_CONFIG_FAILURE:
        return {
            ...state,
            error: action.error
        };
    //
    case gConstants.UPDATE_ASSET_CONFIG_REQUEST:
        return {
            ...state
        };
    //
    case gConstants.GET_ASSET_TAG_SUCCESS:
        return {
          ...state,
          gotData: true,
          tags: action.data
        };
    //
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
    //
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
    //
    case gConstants.ADD_ASSET_BY_CONFIG_REQUEST:
        return state;
    case gConstants.ADD_ASSET_BY_CONFIG_SUCCESS:
        return {
            ...state,
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_ASSET_BY_CONFIG_FAILURE:
        return {
            error: action.error
        };
    //
    case gConstants.ADD_ASSET_BY_CONFIG_FILE_REQUEST:
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
    //
    case gConstants.GET_BASELINES_REQUEST:
        return {
            ...state,
            gettingAsset: true
        };
    case gConstants.GET_BASELINES_SUCCESS:
        return {
            ...state,
            baselines: action.data
        };
    case gConstants.GET_BASELINES_FAILURE:
        return {
            error: action.error
        };
    //
    case gConstants.GET_TIME_RANGE_BY_ASSET_REQUEST:
        return {
            ...state,
            gettingAsset: true
        };
    case gConstants.GET_TIME_RANGE_BY_ASSET_SUCCESS:
        return {
            ...state,
            timeRange: action.data
        };
    case gConstants.GET_TIME_RANGE_BY_ASSET_FAILURE:
        return {
            error: action.error
        };
    //
    case gConstants.ADD_BASELINE_REQUEST:
        return state;
    case gConstants.ADD_BASELINE_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_BASELINE_FAILURE:
        return {
            error: action.error
        };
    //
    case gConstants.GET_TIME_INTERVALS_REQUEST:
        return {
            ...state,
            gettingAsset: true
        };
    case gConstants.GET_TIME_INTERVALS_SUCCESS:
        return {
            ...state,
            timeIntervals: action.data
        };
    case gConstants.GET_TIME_INTERVALS_FAILURE:
        return {
            error: action.error
        };
    //
    case gConstants.REMOVE_DEVICE_REQUEST:
        var config = JSON.parse(JSON.stringify(state.config));        
        config.Devices = config.Devices.filter(item => item.SerialNumber != action.sn);
        return Object.assign({}, state, {
            config: config
        });
    
    case gConstants.UPDATE_DEVICE_REQUEST:
        var config = JSON.parse(JSON.stringify(state.config));        
        config.Devices.find(item => item.SerialNumber === action.data[0])[action.data[1]] = action.data[2];
        return Object.assign({}, state, {
            config: config
        });
    //
    case gConstants.REMOVE_PARAMETER_REQUEST:
        var config = JSON.parse(JSON.stringify(state.config));        
        config.Equations = config.Equations.filter(item => item.Tag != action.tag);
        return Object.assign({}, state, {
            config: config
        });
    
    case gConstants.UPDATE_PARAMETER_REQUEST:
        var config = JSON.parse(JSON.stringify(state.config));        
        config.Equations.find(item => item.Tag === action.data[0])[action.data[1]] = action.data[2];
        return Object.assign({}, state, {
            config: config
        });
    //
    default:
        return state;
  }
}

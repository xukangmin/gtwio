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
        let prevData = state.data ? state.data.AssetData : [];
        let currData = action.data.AssetData;
        let columns = action.data.AssetColumnInfo;

        let result = {
            AssetColumnInfo: columns,
            AssetData: prevData.concat(currData.sort((a,b)=>b.TimeStamp-a.TimeStamp))
        }
        return {
            gotData: true,
            data: result
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
    
    //
    case gConstants.GET_DATA_FOR_BASELINE_SELECTION_REQUEST:
        return {
            ...state,
            gettingDataForBaselineSel: true
        };
    case gConstants.GET_DATA_FOR_BASELINE_SELECTION_SUCCESS:
        return {
            ...state,
            gotData: true,
            baselineSel: action.data
        };
    case gConstants.GET_DATA_FOR_BASELINE_SELECTION_FAILURE:
        return {
            ...state,
            error: action.error
        };
    //
    case gConstants.UPDATE_ASSET_CONFIG_REQUEST:
        return {
            ...state
        };
    default:
        return state;
  }
}

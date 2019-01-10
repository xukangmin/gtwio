import { gConstants } from '../_components/constants';

export const asset = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_ASSET_REQUEST:
        return {
            gettingAsset: true
        };
    case gConstants.GET_ASSET_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_ASSET_FAILURE:
        return {
            error: action.error
        };
    case gConstants.ADD_ASSET_REQEUST:
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
    default:
        return state;
  }
}
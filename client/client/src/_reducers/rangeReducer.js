import { gConstants } from '../_components/constants';

export const range = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_RANGE_REQUEST:
        return {
            ...state,
            gettingDEVICE: true
        };
    case gConstants.GET_RANGE_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_RANGE_FAILURE:
        return {
            error: action.error,
            data: {Items: [], Count: 0}
        };
    case gConstants.UPDATE_RANGE_REQEUST:
        return state;
    case gConstants.UPDATE_RANGE_SUCCESS:
        return {
            ...state,
            addedData: true,
            msg: action.msg
        };
    case gConstants.UPDATE_RANGE_FAILURE:
      console.log(action);
        return {
            ...state,
            error: action.error
        };
    default:
        return state;
  }
}

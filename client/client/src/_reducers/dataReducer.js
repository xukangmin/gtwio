import { gConstants } from '../_components/constants';

export const data = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_DATA_REQEUST:
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
    case gConstants.ADD_DATA_REQEUST:
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

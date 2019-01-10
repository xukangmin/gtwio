import { gConstants } from '../_components/constants';

export const variable = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_VARIABLE_REQUEST:
        return {
            gettingVARIABLE: true
        };
    case gConstants.GET_VARIABLE_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_VARIABLE_FAILURE:
        return {
            error: action.error
        };
    case gConstants.ADD_VARIABLE_REQEUST:
        return state;
    case gConstants.ADD_VARIABLE_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_VARIABLE_FAILURE:
        return {
            error: action.error
        };
    default:
        return state;
  }
}
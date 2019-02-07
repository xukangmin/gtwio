import { gConstants } from '../_components/constants';

export const parameter = (state = {}, action) => {
  switch (action.type) {
    case gConstants.GET_PARAMETER_REQUEST:
        return {
            ...state,
            gettingPARAMETER: true
        };
    case gConstants.GET_PARAMETER_SUCCESS:
        return {
            gotData: true,
            data: action.data
        };
    case gConstants.GET_PARAMETER_FAILURE:
        return {
            error: action.error
        };
    case gConstants.ADD_PARAMETER_REQEUST:
        return state;
    case gConstants.ADD_PARAMETER_SUCCESS:
        return {
            addedData: true,
            msg: action.msg
        };
    case gConstants.ADD_PARAMETER_FAILURE:
        return {
            error: action.error
        };
    default:
        return state;
  }
}

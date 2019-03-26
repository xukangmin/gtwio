import { gConstants } from '../Constants/constants';


export const reset = (state = {}, action) => {
  switch (action.type) {
    case gConstants.RESET_REQUEST:
      return { resetting: true };
    case gConstants.RESET_SUCCESS:
      return { 
          msg: action.msg.message, 
          reset: true
        };
    case gConstants.RESET_FAILURE:
      return {
          reset: false,
          msg: action.error
      };
    default:
      return state
  }
}
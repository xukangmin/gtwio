import { gConstants } from '../Constants/constants';


export const reg = (state = {}, action) => {
  switch (action.type) {
    case gConstants.REGISTER_REQUEST:
      return { registering: true };
    case gConstants.REGISTER_SUCCESS:
      return { 
          user: action.user, 
          registered: true
        };
    case gConstants.REGISTER_FAILURE:
      return {};
    default:
      return state
  }
}
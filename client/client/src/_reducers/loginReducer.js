import { gConstants } from '../Constants/constants';


export const login = (state = {}, action) => {
  switch (action.type) {
      case gConstants.LOGIN_REQUEST:
        return {
          loggingIn: true,
          user: action.user
        };
      case gConstants.LOGIN_SUCCESS:
        return {
          loggedIn: true,
          user: action.user
        };
      case gConstants.LOGIN_FAILURE:
        return {};
      case gConstants.LOGOUT:
        return {};
      default:
          return state;
  }
}
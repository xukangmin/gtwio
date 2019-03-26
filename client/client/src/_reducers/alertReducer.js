import { gConstants } from '../Constants/constants';

export function alert(state = {}, action) {
  switch (action.type) {
    case gConstants.SUCCESS:
      return {
        type: 'alert-success',
        message: action.message
      };
    case gConstants.ERROR:
      return {
        type: 'alert-danger',
        message: action.message
      };
    case gConstants.CLEAR:
      return {};
    case gConstants.INFO:
      return {
        type: gConstants.INFO,
        message: action.message
      };
    default:
      return state
  }
}
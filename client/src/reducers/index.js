import { combineReducers } from 'redux';
import user from './user';
import flash from './flash';
import messages from './messages';
import isTyping from './isTyping'

const rootReducer = combineReducers({
  user,
  flash,
  messages,
  isTyping,
});

export default rootReducer;

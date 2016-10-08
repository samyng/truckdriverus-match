import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import authReducer from './auth_reducer';

const rootReducer = combineReducers({
  form,
  auth: authReducer //If authReducer was named auth, then I could just enter auth just like form
});

export default rootReducer;

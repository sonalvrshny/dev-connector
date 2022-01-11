// combining multiple reducers
import { combineReducers } from "redux";
import alert from './alert';

export default combineReducers({
    alert
});
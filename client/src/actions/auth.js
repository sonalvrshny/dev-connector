import api from '../utils/api';
import { REGISTER_SUCCESS, REGISTER_FAIL, USER_LOADED, AUTH_ERROR, LOGIN_SUCCESS, LOGIN_FAIL } from './types';
import {setAlert} from './alert';
// Load user
export const loadUser = () => async dispatch => {
    // set header with token

    try {
        const res = await api.get('/auth');

        dispatch({
            type: USER_LOADED,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: AUTH_ERROR
        });
    }
}

// Register user action
export const register = ({name, email, password}) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({name, email, password});

    try {
        const res = await api.post('/users', body, config);

        // if we dont get error
        dispatch({
            type: REGISTER_SUCCESS,
            // data that we get back -that is the token 
            payload:res.data
        });
        dispatch(loadUser());
    } catch (err) {
        // errors defined in the backend
        const errors = err.response.data.errors;
        if (errors) {
            console.log(errors);
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }

        dispatch({
            type: REGISTER_FAIL
        });
    }
};


// Login user action
export const login = (email, password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ email, password });

    try {
        const res = await api.post('/auth', body, config);

        // if we dont get error
        dispatch({
            type: LOGIN_SUCCESS,
            // data that we get back -that is the token 
            payload: res.data
        });
        dispatch(loadUser());
    } catch (err) {
        // errors defined in the backend
        const errors = err.response.data.errors;
        if (errors) {
            console.log(errors);
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }

        dispatch({
            type: LOGIN_FAIL
        });
    }
};
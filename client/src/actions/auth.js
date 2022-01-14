import axios from 'axios';
import { REGISTER_SUCCESS, REGISTER_FAIL } from './types';
import {setAlert} from './alert';

// Register user action
export const register = ({name, email, password}) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({name, email, password});

    try {
        const res = await axios.post('/api/users', body, config);

        // if we dont get error
        dispatch({
            type: REGISTER_SUCCESS,
            // data that we get back -that is the token 
            payload:res.data
        });
    } catch (err) {
        // errors defined in the backend
        const errors = err.respose.data.errors;
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }

        dispatch({
            type: REGISTER_FAIL
        });
    }
}
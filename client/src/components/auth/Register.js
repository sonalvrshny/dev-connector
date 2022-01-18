import React, { Fragment, useState } from 'react'
// import axios from 'axios';
import {Link, Navigate} from 'react-router-dom';
// connect react to redux
import { connect } from 'react-redux';
// get in the action from redux
import { setAlert } from '../../actions/alert';
import PropTypes from 'prop-types';
import { register } from '../../actions/auth';


export const Register = ({setAlert, register, isAuthenticated}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    });

    const { name, email, password, password2 } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== password2) {
            // danger is defined in css - will change colour, bg or anything 
            setAlert('Passwords do not match', 'danger');
        }
        else {
            register({name, email, password});
            /**
             * This is an example of how to make an http request using axios
             */
            // const newUser = {
            //     name,
            //     email,
            //     password
            // }

            // try {
            //     const config = {
            //         headers : {
            //             'Content-Type': 'application/json'
            //         }
            //     }

            //     const body = JSON.stringify(newUser);
            //     // similar to what we pass in to postman 
            //     const res = await axios.post('/api/users', body, config);

            //     // should get back the token which is returned when user logs in
            //     console.log(res.data);
            // } catch (err) {
            //     console.error(err.response.data);
            // }
        }
    };

    if (isAuthenticated) {
        return <Navigate to = "/dashboard"/>
    }

    return (
        <Fragment>
            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>

            <form className="form" onSubmit={e => onSubmit(e)}>
                <div className="form-group">
                <input 
                    type="text" 
                    placeholder="Name" 
                    name="name" 
                    value = {name} 
                    onChange = {e => onChange(e)} 
                    // required 
                />
                </div>
                <div className="form-group">
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    name="email" 
                    value = {email} 
                    onChange = {e => onChange(e)} 
                    // required 
                />
                <small className="form-text"
                    >This site uses Gravatar so if you want a profile image, use a
                    Gravatar email</small
                >
                </div>
                <div className="form-group">
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value = {password} 
                    onChange = {e => onChange(e)}
                    // minLength="6"
                />
                </div>
                <div className="form-group">
                <input
                    type="password"
                    placeholder="Confirm Password"
                    name="password2"
                    value = {password2} 
                    onChange = {e => onChange(e)}
                    // minLength="6"
                />
                </div>
                <input type="submit" className="btn btn-primary" value="Register" />
            </form>
            <p className="my-1">
                Already have an account? <Link to="/login">Sign In</Link>
            </p>
        </Fragment>
    )
}

Register.propTypes ={
    setAlert: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, {setAlert, register})(Register);
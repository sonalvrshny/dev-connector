import React, {Fragment, useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import './App.css';

// Redux imports
// connects react to redux
import {Provider} from 'react-redux';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import { loadUser } from './actions/auth';



const App = () => { 
  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    store.dispatch(loadUser());
  }, []);

  return (
  <Provider store = {store}>
    <Router>
      <Fragment>
        <Navbar />

        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
        <section className="container">
          <Alert />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} /> 
          </Routes>
        </section>
      </Fragment>
    </Router>
  </Provider>
)};
export default App;

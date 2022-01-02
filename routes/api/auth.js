const express = require('express');
const User = require('../../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/tokenAuth');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

// @route  GET api/auth
// @desc   Test route
// @access Public (do not need token)
router.get('/', auth, async (req, res) => {
    try {
        // get the decoded user which we got from the middleware
        // exclude the password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route  POST api/auth
// @desc   Authenticate user and get token
// @access Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 is a bad request, 200 response is OK
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try {
        // check if user does not exist
        let user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({errors: [{msg: 'Invalid credentials'}]});
        }

        // user found, check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({errors: [{msg: 'Invalid credentials'}]});
        }

        // return jwt
        const payload = {
            user: {
                id: user.id
            }
        }
        // add a secret which is defined in default.json
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({token});
                } 
            );

        // res.send('User route');
        // res.send('User registered');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

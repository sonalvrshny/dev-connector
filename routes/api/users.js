const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

// get user model
const User = require('../../models/User')

// @route  GET api/users
// @desc   Test route
// @access Public (do not need token)
// this is to test using get if route is responding
// router.get('/', (req, res) => res.send('User route'));

// @route  POST api/users
// @desc   Register user
// @access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Minimum length is 6 characters').isLength({min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 is a bad request, 200 response is OK
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        // check if user exists
        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({errors: [{msg: 'User already exixts'}]});
        }

        // get gravatar
        const avatar = gravatar.url(email, {
            // size, rating, default
            s: '200', r:'pg', d:'mm'
        })

        user = new User({
            name, email, avatar, password
        });

        // encrypt password
        // salt is used for hashing - here 10 indicates the number of rounds - high means secure but slower
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // save the user 
        await user.save();

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
        res.send('User registered');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

const express = require('express');
const User = require('../../models/User');
const router = express.Router();
const auth = require('../../middleware/tokenAuth');

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

module.exports = router;

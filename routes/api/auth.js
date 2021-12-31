const express = require('express');
const router = express.Router();

// @route  GET api/auth
// @desc   Test route
// @access Public (do not need token)
router.get('/', (req, res) => res.send('Auth route'));

module.exports = router;

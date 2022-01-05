const express = require('express');
const auth = require('../../middleware/tokenAuth');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET api/profile
// @desc   Test route
// @access Public (do not need token)
// router.get('/', (req, res) => res.send('Profile route'));

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
// Here we are getting user id from token - which means token is required - hence private
// Adding the auth as middleware in second parameter
router.get('/me', auth, async (req, res) => {
    try {
        // this is refering to the ObjectId created as the first field in ProfileSchema
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            res.status(400).json({msg: "There is no profile for this user"});
        }

        res.json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  Post api/profile
// @desc   Create or update a user profile
// @access Private
// Here we are going to need the auth middleware as well as the validator middleware
// They would go in [] in the second parameter
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // update
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, {$set: 
            profileFields}, { new: true });

            return res.json(profile);
        }

        // create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  Get api/profile
// @desc   Get all profiles
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  Get api/profile/user/:user_id
// @desc   Get profile by id
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route  Delete api/profile
// @desc   Delete profile, user and posts
// @access Private
router.delete('/', auth, async (req, res) => {
    try {
        // remove profile 
        await Profile.findOneAndRemove({ user: req.user.id });

        // remove user 
        await User.findOneAndRemove({ _id: req.user.id });
        
        res.json({ msg: 'User removed'});
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
});


// @route  Put api/profile/experience
// @desc   Add profile experience
// @access Private
// there' auth middleware and validator middleware
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        title,
        company,
        location,
        from, 
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  Delete api/profile/experience/:exp_id
// @desc   Delete experience from profile
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        // find profile
        const profile = await Profile.findOne({ user: req.user.id });
        
        if (profile.experience) {
            profile.experience = profile.experience.filter(
                profExp => profExp._id.toString() !== req.params.exp_id.toString()
            );
        }

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

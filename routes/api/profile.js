const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const normalize = require('normalize-url');
const checkObjectById = require('../../middleware/checkObjectById');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

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
        const profile = await Profile.findOne({ 
            user: req.user.id 
        }).populate('user', ['name', 'avatar']);

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
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills is required').notEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        ...rest
    } = req.body;

    // build profile object
    const profileFields = {
        user: req.user.id,
        website:
            website && website !== ''
            ? normalize(website, {forceHttps:true}) 
            : '',
        skills: 
            Array.isArray(skills) 
            ? skills 
            : skills.split(',').map((skill) => ' ' + skill.trim()),
        ...rest
    }

    // build social fields object
    const socialFields = {youtube, twitter, instagram, linkedin, facebook};

    // ensure valid url using normalize
    for (const [key, value] of Object.entries(socialFields)) {
        if (value && value.length>0) {
            socialFields[key] = normalize(value, {forceHttps:true});
        }
    }

    profileFields.social = socialFields;

    try {
        let profile = await Profile.findOneAndUpdate(
            {user: req.user.id},
            {$set: profileFields},
            {new: true, upsert: true, setDefaultsOnInsert: true}
        );

        return res.json(profile);
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
router.get(
    '/user/:user_id',
    checkObjectById('user_id'),
    async ({params: {user_id}}, res) => {
    try {
        const profile = await Profile.findOne({ user: user_id }).populate('user', ['name', 'avatar']);
        
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        
        return res.json(profile);
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
        // remove profile, post, user

        await Promise.all([
            Post.deleteMany({user: req.user.id}),
            Profile.findOneAndRemove({user: req.user.id}),
            User.findOneAndRemove({_id: req.user.id})
        ]);
        
        
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
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from past')
        .notEmpty()
        .custom((value, {req}) => (req.body.to ? value < req.body.to : true)),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }


    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(req.body);

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

        return res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  Put api/profile/education
// @desc   Add profile education
// @access Private
// there's auth middleware and validator middleware
router.put('/education', [auth, [
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    check('from', 'From date is required')
    .notEmpty()
    .custom((value, {req}) => (req.body.to ? value < req.body.to : true)),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }


    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(req.body);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  Delete api/profile/education/:edu_id
// @desc   Delete education from profile
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        // find profile
        const profile = await Profile.findOne({ user: req.user.id });
        
        if (profile.education) {
            profile.education = profile.education.filter(
                profEdu => profEdu._id.toString() !== req.params.edu_id.toString()
            );
        }

        await profile.save();

        return res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  Get api/profile/github/:username
// @desc   Get user repo from github
// @access Public
router.get('/github/:username', async (req, res) => {
    try {
      const uri = encodeURI(
        `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
      );
      const headers = {
        'user-agent': 'node.js',
        Authorization: `token ${config.get('githubToken')}`
      };
  
      const gitHubResponse = await axios.get(uri, { headers });
      return res.json(gitHubResponse.data);
    } catch (err) {
      console.error(err.message);
      return res.status(404).json({ msg: 'No Github profile found' });
    }
  });

module.exports = router;

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/tokenAuth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

// @route  Post api/posts
// @desc   Create a post
// @access Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        // save post details in new post
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route  Post api/posts
// @desc   Get all posts
// @access Private (can only see posts if logged in)
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route  Post api/posts/:id
// @desc   Get post by id
// @access Private (can only see posts if logged in)
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // if post is not found
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        // if id passed is not valid
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route  Delete api/posts/:id
// @desc   Delete a post by id
// @access Private (can only see posts if logged in)
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // make sure user deleting post was actually made by that user
        if (post.user.toString() !== req.user.id) {
            // 401 is not authorized
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();

        // if post is not found
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json({ msg: 'Post removed' });
    } catch (err) {
        // if id passed is not valid
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;

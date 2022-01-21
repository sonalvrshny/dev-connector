const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

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

// @route  Get api/posts
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

        // if post is not found
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // make sure user deleting post was actually made by that user
        if (post.user.toString() !== req.user.id) {
            // 401 is not authorized
            return res.status(401).json({ msg: 'User not authorized' });
        }

        

        await post.remove();
        

        res.json({ msg: 'Post removed' });
    } catch (err) {
        // if id passed is not valid
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route  Put api/posts/like/:id - need to know id of post being liked
// @desc   Like a post
// @access Private (can only see posts if logged in)
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // if post is not found
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // check if post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            // 400 is bad request
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route  Put api/posts/unlike/:id
// @desc   Unlike a post
// @access Private (can only see posts if logged in)
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // if post is not found
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // check if post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            // 400 is bad request
            return res.status(400).json({ msg: 'Post has not been liked' });
        }


        // get the remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        if (removeIndex !== -1) {
            post.likes.splice(removeIndex, 1);
        }

        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// @route  Post api/posts/comment/:id
// @desc   Comment on a post based on id
// @access Private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        // save comment details in  post
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route  Delete api/posts/comment/:id/:comment_id
// @desc   Delete a comment
// @access Private (can only see posts if logged in)
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // if post is not found
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const comment = post.comments.find(comment => comment.id = req.params.comment_id);


        // make sure comment exists
        if (!comment) {
            return res.status(404).json({ msg: "Comment does not exist" });
        }

        // make sure user deleting comment was actually made by that user
        if (comment.user.toString() !== req.user.id) {
            // 401 is not authorized
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // get the remove index
        const removeIndex = post.comments.map(comment => comment.id.toString()).indexOf(req.params.comment_id);
        if (removeIndex !== -1) {
            post.comments.splice(removeIndex, 1);
        }
        else {
            return res.status(404).json({ msg: "Comment does not exist" });
        }

        await post.save();

        res.json(post.comments);
    } catch (err) {
        // if id passed is not valid
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

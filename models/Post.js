const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    // a post is connected to a user
    user: {
        type: Schema.Types.ObjectId
    },
    text: {
        type: String,
        required: true
    },
    // if user deletes account - the post is not deleted
    // so, the name and avatar are set
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    likes: [
        // array of users who like the post
        {
            user: {
                type: Schema.Types.ObjectId
            }
        }
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);
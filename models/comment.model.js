const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    storyId: {
        type: Schema.Types.ObjectId,
        ref: 'Story'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Comment', commentSchema, 'comments')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    profileImg: {
        type: String
    },
    profileImgId: {
        type: String
    },
    profileImgSecureUrl: {
        type: String
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    usertype: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    bio: {
        type: String,
        default: ''
    },
    feedbacks: [],
    saved: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Story'
        }
    ],
    totalStories: {
        type: Number,
        default: 0
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema, 'users')
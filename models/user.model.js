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
    feedbacks: []
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema, 'users')
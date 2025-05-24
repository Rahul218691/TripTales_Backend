const { HttpError } = require('../utils')
const { uploadImage, deleteResource } = require('../helpers/upload.helper')
const UserDto = require('../dtos/user.dto')
const { updateUser, findUser } = require('../services/user.services')

class UserController {
    async updateUserProfile(req, res, next) {
        try {
            const file = req.file
            const user = req.user
            const { username, bio } = req.body
            if (!username || !bio) return next(new HttpError('All fields required', 400))
            if (!user.profileImg && !file) return next(new HttpError('Choose Profile Picture', 400)) 
            const payload = {
                username,
                bio
            }
            const userInfo = await findUser({ _id: user._id })
            if (userInfo.profileImgId) {
                await deleteResource([userInfo.profileImgId])
            }
            if (file) {
                const result = await uploadImage(file, 'TripTales/profile')
                const imageRes = result[0]
                const { public_id, secure_url, url } = imageRes
                payload.profileImg = url
                payload.profileImgSecureUrl = secure_url
                payload.profileImgId = public_id
            }
            const updatedUser = await updateUser(payload, user._id)
            req.file = null
            res.status(201).json(new UserDto(updatedUser))
         } catch (error) {
             next(error)
         }
    }

    async getUserProfile(req, res, next) {
        try {
            const { id } = req.params
            const user = await findUser({ _id: id })
            res.status(200).json(new UserDto(user))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController()
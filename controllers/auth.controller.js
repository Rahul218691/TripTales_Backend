const { OAuth2Client } = require('google-auth-library')
const { HttpError } = require('../utils')
const UserDto = require('../dtos/user.dto')
const { findUser, createUser } = require('../services/user.services')
const { generateTokens, storeRefreshToken, verifyRefreshToken, findRefreshToken, updateUserRefreshToken, removeToken } = require('../services/token.services')

const client = new OAuth2Client()

class AuthController {
    async googleSignInUser(req, res, next) {
        const { token } = req.body
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            })
            const payload = ticket.getPayload()
            const { email, name, email_verified } = payload

            // Check if user exists in the database
            let user = await findUser({ email })
            if (!user) {
                user = await createUser({
                    username: name,
                    email,
                    verified: email_verified
                })
            }

            // Generate tokens
            const { accessToken, refreshToken } = await generateTokens({
                _id: user._id,
                email: user.email,
                usertype: user.usertype,
                profileImg: user.profileImg,
                profileImgSecureUrl: user.profileImgSecureUrl,
                username: user.username
            })

            // Store refresh token in the database
            await storeRefreshToken(refreshToken, user._id)

            // Set cookies for tokens
            res.cookie('triptale_refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            })
            res.cookie('triptale_accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            })

            // Send response with user data
            const userDto = new UserDto(user)
            res.status(200).json({
                user: userDto,
                auth: true
            })
        } catch (error) {
            next(error)
        }
    }
    async refreshUserToken(req, res, next) {
        const { triptale_refreshToken: refreshTokenFromCookie } = req.cookies
        try {
            const userData = await verifyRefreshToken(refreshTokenFromCookie)
            if (!userData) return next(new HttpError('Invalid Token', 401))

            const token = await findRefreshToken(userData._id, refreshTokenFromCookie)
            if (!token) return next(new HttpError('Invalid Token', 401))

            const user = await findUser({ _id: userData._id })
            if (!user) return next(new HttpError('User not found', 401))

            const { accessToken, refreshToken } = await generateTokens({
                _id: user._id,
                email: user.email,
                usertype: user.usertype,
                profileImg: user.profileImg,
                profileImgSecureUrl: user.profileImgSecureUrl,
                username: user.username
            })

            await updateUserRefreshToken(refreshToken, user._id)

            res.cookie('triptale_refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            })
            res.cookie('triptale_accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            })

            const userDto = new UserDto(user)
            res.status(200).json({
                user: userDto,
                auth: true
            })
        } catch (error) {
            next(error)
        }
    }
    async logoutUser(req, res, next) {
        const { triptale_refreshToken: refreshTokenFromCookie } = req.cookies
        try {
            await removeToken(refreshTokenFromCookie)
            res.clearCookie('triptale_refreshToken')
            res.clearCookie('triptale_accessToken')
            res.status(200).json({
                message: 'Logout successful'
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AuthController()
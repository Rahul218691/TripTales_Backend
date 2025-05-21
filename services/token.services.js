const JWT = require('jsonwebtoken')
const RefreshModel = require('../models/refreshToken.model')

class Tokenservice {
    async generateTokens(payload) {
        const accessToken = JWT.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
         expiresIn: '1h'
        })
        const refreshToken = JWT.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
         expiresIn: '1y'
        })
 
        return {
         accessToken,
         refreshToken
        }
     }
 
     async storeRefreshToken(token, userId) {
         try {
             await RefreshModel.create({
                 token,
                 userId
             })
         } catch (error) {
             console.log(error.message)
         }
     }
 
     async verifyAccessToken(token) {
         return JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
     }
 
     async verifyRefreshToken(token) {
         return JWT.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET)
     }
 
     async findRefreshToken(userId, refreshToken) {
         return await RefreshModel.findOne({ userId, token: refreshToken })
     }
 
     async updateUserRefreshToken(token, userId) {
         return await RefreshModel.updateOne({
             userId
         }, {
             token
         })
     }
 
     async removeToken(rftoken) {
        return await RefreshModel.deleteOne({ token: rftoken })
     }
}

module.exports = new Tokenservice()
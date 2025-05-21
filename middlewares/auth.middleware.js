const { verifyAccessToken } = require('../services/token.services')
const { HttpError } = require('../utils')

module.exports = async function(req, res, next) {
    try {
        const { triptale_accessToken: accessToken } = req.cookies
        if (!accessToken) {
            return next(new HttpError('Invalid credentials', 401))
        }
        const userData = await verifyAccessToken(accessToken)
        if (!userData) {
            return next(new HttpError('Invalid credentials', 401))
        }
        req.user = userData;
        next()   
    } catch (error) {
        next(error)
    }
}
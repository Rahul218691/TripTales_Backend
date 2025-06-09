const { verifyAccessToken } = require('../services/token.services')

module.exports = async function(req, res, next) {
    try {
        const { triptale_accessToken: accessToken } = req.cookies
        if (!accessToken) {
            req.user = null
            return next()
        }
        const userData = await verifyAccessToken(accessToken)
        if (!userData) {
            req.user = null
            return next()
        }
        req.user = userData;
        next()   
    } catch (error) {
        req.user = null
        next()
    }
}
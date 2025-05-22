const router = require('express').Router();
const { googleSignInUser, logoutUser, refreshUserToken } = require('./controllers/auth.controller')

// ============================================== AUTH APIS ====================================================================================== //

router.post('/api/login', googleSignInUser)
router.get('/api/refreshToken', refreshUserToken)
router.post('/api/logout', logoutUser)

// =============================================================================================================================================== //

module.exports = router
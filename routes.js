const router = require('express').Router();
const { googleSignInUser, logoutUser, refreshUserToken } = require('./controllers/auth.controller')
const { updateUserProfile, getUserProfile } = require('./controllers/user.controller');
const { upload } = require('./helpers/upload.helper');
const authMiddleware = require('./middlewares/auth.middleware')

// ============================================== AUTH APIS ====================================================================================== //

router.post('/api/login', googleSignInUser)
router.get('/api/refreshToken', refreshUserToken)
router.post('/api/logout', logoutUser)

// =============================================================================================================================================== //

// ============================================== User APIS ======================================================================================= //

router.get('/api/profile/:id', getUserProfile)
router.post('/api/profile/update', authMiddleware, upload.single('profile'), updateUserProfile)

// ================================================================================================================================================ //

module.exports = router
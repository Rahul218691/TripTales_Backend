const router = require('express').Router();
const { googleSignInUser, logoutUser, refreshUserToken, createTestToken } = require('./controllers/auth.controller');
const { createStory } = require('./controllers/story.controller');
const { updateUserProfile, getUserProfile } = require('./controllers/user.controller');
const { upload } = require('./helpers/upload.helper');
const authMiddleware = require('./middlewares/auth.middleware')
const testMiddleware = require('./middlewares/test.middleware')

// ============================================== AUTH APIS ====================================================================================== //

router.post('/api/login', googleSignInUser)
router.get('/api/refreshToken', refreshUserToken)
router.post('/api/logout', logoutUser)
router.get('/api/token/:id', createTestToken)

// =============================================================================================================================================== //

// ============================================== User APIS ======================================================================================= //

router.get('/api/profile/:id', getUserProfile)
router.post('/api/profile/update', authMiddleware, upload.single('profile'), updateUserProfile)

// ================================================================================================================================================ //

// ============================================== Story APIS ====================================================================================== //

router.post('/api/create/story', authMiddleware, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'storyImages', maxCount: 10 },
    { name: 'storyVideos', maxCount: 5 }
]), createStory)

// ================================================================================================================================================ //
module.exports = router
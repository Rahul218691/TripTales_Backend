const router = require('express').Router();
const { googleSignInUser, logoutUser, refreshUserToken, createTestToken } = require('./controllers/auth.controller');
const { createStory, getStoryDetails, updateStoryViewCount, updateStoryLikeCount, getStoriesList, addStoryComment, getStoryComments, addStoryToSaved, deleteStoryComment } = require('./controllers/story.controller');
const { updateUserProfile, getUserProfile } = require('./controllers/user.controller');
const { upload, diskUpload } = require('./helpers/upload.helper');
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

router.post('/api/create/story', testMiddleware, diskUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'storyImages', maxCount: 10 },
    { name: 'storyVideos', maxCount: 5 }
]), createStory)

router.get('/api/story/:id', getStoryDetails)
router.patch('/api/story/view', updateStoryViewCount)
router.patch('/api/story/like/:id', authMiddleware, updateStoryLikeCount)
router.get('/api/stories', getStoriesList)

router.post('/api/create/comment', authMiddleware, addStoryComment)
router.get('/api/comments/:id', getStoryComments)
router.post('/api/story/save', authMiddleware, addStoryToSaved)
router.delete('/api/delete/comment/:storyId/:commentId', authMiddleware, deleteStoryComment)

// ================================================================================================================================================ //
module.exports = router
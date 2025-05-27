const { HttpError } = require('../utils')
const { agenda } = require('../services/db')

class StoryController {
    async createStory (req, res, next) {
        try {
            const { 
                title,
                content,
                location,
                locationMapLink,
                budget,
                travelDate,
                tripType,
                transportation,
                highlights,
                tips,
                storyType,
             } = req.body

             if (!title || !content || !location || !budget || !travelDate || !tripType || !transportation) {
                return next(new HttpError('All fields are required', 400))
             }

             const coverImageBuffer = req.files?.coverImage?.[0]?.buffer || null;
             const storyImagesBuffers = req.files?.storyImages?.map(file => file.buffer) || [];
             const videosBuffers = req.files?.storyVideos?.map(file => file.buffer) || [];

            if (!coverImageBuffer) {
                return next(new HttpError('cover image is required', 400))
            }

            if (!storyImagesBuffers || storyImagesBuffers.length === 0) {
                return next(new HttpError('At least one story image is required', 400))
            }
            if (videosBuffers && videosBuffers.length > 5) {
                return next(new HttpError('You can upload a maximum of 5 videos', 400))
            }
            if (coverImageBuffer && coverImageBuffer.size > 5 * 1024 * 1024) {
                return next(new HttpError('Cover image size should not exceed 5MB', 400))
            }
            if (storyImagesBuffers.some(image => image.size > 5 * 1024 * 1024)) {
                return next(new HttpError('Story images size should not exceed 5MB each', 400))
            }
            if (videosBuffers && videosBuffers.some(video => video.size > 50 * 1024 * 1024)) {
                return next(new HttpError('Videos size should not exceed 50MB each', 400))
            }

            const jobData = {
                title,
                content,
                location,
                locationMapLink,
                budget,
                travelDate,
                tripType,
                transportation,
                userId: req.user._id,
                tips: tips ? JSON.parse(tips) : [],
                coverImageBuffer,
                storyImagesBuffers,
                videosBuffers,
                highlights: highlights ? JSON.parse(highlights) : [],
                storyType
            }
            await agenda.now('process travel story', jobData)
            req.files = null
            res.status(201).json({
                message: 'Story creation in progress'
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new StoryController()
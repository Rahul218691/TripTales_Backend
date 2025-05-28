const { HttpError } = require('../utils')
const { agenda } = require('../services/db')
const fs = require('fs').promises;

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

            const coverImagePath = req.files?.coverImage?.[0]?.path || null;
            const storyImagesPaths = req.files?.storyImages?.map(file => file.path) || [];
            const videosPaths = req.files?.storyVideos?.map(file => file.path) || [];

            if (!coverImagePath) {
                return next(new HttpError('Cover image is required', 400));
            }

            if (!storyImagesPaths || storyImagesPaths.length === 0) {
                return next(new HttpError('At least one story image is required', 400));
            }

            if (videosPaths && videosPaths.length > 5) {
                return next(new HttpError('You can upload a maximum of 5 videos', 400));
            }

            const coverImageBuffer = coverImagePath ? await fs.readFile(coverImagePath) : null;
            const storyImagesBuffers = await Promise.all(
                storyImagesPaths.map(async (imagePath) => await fs.readFile(imagePath))
            );
            const videosBuffers = await Promise.all(
                videosPaths.map(async (videoPath) => await fs.readFile(videoPath))
            );

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
                coverImagePath,
                storyImagesPaths,
                videosPaths,
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
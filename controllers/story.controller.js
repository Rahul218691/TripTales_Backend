const fs = require('fs').promises;
const { HttpError } = require('../utils')
const { agenda } = require('../services/db')
const { getStory, updateViewCount, getStories, addComment, getComments, saveStory, deleteComment } = require('../services/story.services')

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

    async getStoryDetails (req, res, next) {
        try {
            const { id } = req.params
            if (!id) {
                return next(new HttpError('Story ID is required', 400))
            }
            const result = await getStory(id)
            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }

    async updateStoryViewCount (req, res, next) {
        try {
            const { id } = req.params
            if (!id) {
                return next(new HttpError('Story ID is required', 400))
            }
            await updateViewCount(id)
            return res.status(204).send()
        } catch (error) {
            next(error)
        }
    }

    async updateStoryLikeCount (req, res, next) {
        try {
            const { id } = req.params
            if (!id) {
                return next(new HttpError('Story ID is required', 400))
            }
            await addStoryLike(id)
            return res.status(204).send()
        } catch (error) {
            next(error)
        }
    }

    async getStoriesList (req, res, next) {
        try {
            let { page, limit, search, tripType, transportation, sortBy, isMyStories, userId } = req.query
            page = page ? Number(page) : 1
            limit = limit ? Number(limit) : 10
            const filters = {
                location: search,
                tripType,
                transportation,
                sortBy
            }
            if (isMyStories && userId) {
                filters.isMyStories = isMyStories
                filters.createdBy = userId
            }
            const result = await getStories(page, limit, filters)
            return res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }

    async addStoryComment (req, res, next) {
        try {
            const { content, storyId } = req.body
            const userId = req.user._id
            const data = {
                content,
                userId,
                storyId
            }
            const comment = await addComment(data)
            return res.status(201).json(comment)
        } catch (error) {
            next(error)
        }
    }

    async getStoryComments (req, res, next) {
        try {
            const { id } = req.params
            let { page, limit } = req.query
            page = page ? Number(page) : 1
            limit = limit ? Number(limit) : 10
            const comments = await getComments(page, limit, id)
            return res.status(200).json(comments)
        } catch (error) {
            next(error)
        }
    }

    async deleteStoryComment (req, res, next) {
        try {
            const { storyId, commentId } = req.params
            const user = req.user._id
            await deleteComment(storyId, commentId, user)
            return res.status(200).json({
                message: 'Comment removed successfully'
            })
        } catch (error) {
            next(error)
        }
    }

    async addStoryToSaved (req, res, next) {
        try {
            const userId = req.user._id
            const { storyId, action } = req.body
            const story = await saveStory(userId, storyId, action)
            return res.status(200).json(story)
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new StoryController()
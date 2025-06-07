const TravelStoryModel = require('../../models/story.model');
const UserSchema = require('../../models/user.model');
const { agenda } = require('../db')
const { calculateReadTime } = require('../../utils');
const { uploadImage } = require('../../helpers/upload.helper');
const { pusher } = require('../../helpers/pusher.helper')
const fs = require('fs').promises;

agenda.define('process travel story', {
    concurrency: 1,
    attempts: 5,
    backoff: {
        type: 'exponential',
        delay: 2000 // Start with a 2-second base delay for exponential backoff
    },
}, async (job) => {
    const {
        title,
        content,
        location,
        locationMapLink,
        budget,
        travelDate,
        tripType,
        transportation,
        userId,
        tips,
        coverImageBuffer,
        storyImagesBuffers,
        videosBuffers,
        coverImagePath,
        storyImagesPaths,
        videosPaths,
        highlights,
        storyType
    } = job.attrs.data;

    try {
        const readTime = calculateReadTime(content)
        let coverImage = {}
        let storyVideos = []
        if (coverImageBuffer) {
            let result = await uploadImage(coverImageBuffer, 'TripTales/coverImages')
            const { public_id, secure_url, url } = result[0]
            await fs.unlink(coverImagePath)
            coverImage = {
                publicId: public_id,
                secureUrl: secure_url,
                url
            }
        }

        const storyImages = await uploadImage(storyImagesBuffers, 'TripTales/storyImages')
        storyImagesPaths.map(async(path) => await fs.unlink(path))
        const images = storyImages.map((img, i) => {
            return {
                url: img.url,
                secureUrl: img.secure_url,
                publicId: img.public_id,
            }
        })

        if (videosBuffers) {
            storyVideos = await uploadImage(videosBuffers, 'TripTales/storyVideos')
        }
        videosPaths.map(async(path) => await fs.unlink(path))
        const videos = storyVideos.map((video, i) => {
            return {
                url: video.url,
                secureUrl: video.secure_url,
                publicId: video.public_id,
            }
        })

        const newStory = new TravelStoryModel({
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
            storyType: storyType ? storyType : 'public',
            storyReadTime: readTime,
            createdBy: userId,
            coverImage,
            storyImages: images,
            storyVideos: videos
        })

        const savedStory = await newStory.save();
        await UserSchema.findByIdAndUpdate(userId, {
            $inc: { totalStories: 1 }
        })
        
        console.log(`Agenda: Story "${savedStory.title}" processed and saved successfully!`);

        // You can update job progress or complete it if needed

        job.attrs.data.progress = { status: 'completed', storyId: savedStory._id };
        await job.save();
        // Code to notify users here
        const channel = `trip_tales_mystory_${userId}`
        pusher.trigger(channel, 'story_creation', {
            message: {
                text: 'Story Published Successfully',
                storyId: savedStory._id
            }
        })

    } catch (error) {
        console.error('Agenda: Error processing story job:', error);
        storyImagesPaths.map(async(path) => await fs.unlink(path))
        videosPaths.map(async(path) => await fs.unlink(path))
        await fs.unlink(coverImagePath)
        // Agenda will automatically retry based on its configuration
        job.fail(error.message); // Mark job as failed
        await job.save();
    }
})
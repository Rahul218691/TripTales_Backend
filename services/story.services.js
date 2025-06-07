const mongoose = require('mongoose');
const StorySchema = require('../models/story.model')
const CommentSchema = require('../models/comment.model')
const UserSchema = require('../models/user.model')

 const getStory = (id, userId) => {
    return new Promise(async(resolve, reject) => {
        try {
            const story = await StorySchema.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(String(id)) }
                },
                {
                    $lookup: {
                        from: 'users', // The collection name for the User model
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdByDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$createdByDetails',
                        preserveNullAndEmptyArrays: true // In case the user is not found
                    }
                },
                {
                    $project: {
                        title: 1,
                        content: 1,
                        location: 1,
                        locationMapLink: 1,
                        budget: 1,
                        travelDate: 1,
                        storyReadTime: 1,
                        likes: { $size: "$likes" },
                        hasLiked: {
                            $cond: {
                                if: { $and: [userId ? { $in: [String(userId), "$likes"] } : false] },
                                then: true,
                                else: false
                            }
                        },
                        views: 1,
                        tripType: 1,
                        transportation: 1,
                        tips: 1,
                        highlights: 1,
                        storyType: 1,
                        createdAt: 1,
                        coverImage: {
                            url: '$coverImage.url',
                            secureUrl: '$coverImage.secureUrl'
                        },
                        storyImages: {
                            $map: {
                                input: '$storyImages',
                                as: 'image',
                                in: {
                                    url: '$$image.url',
                                    secureUrl: '$$image.secureUrl'
                                }
                            }
                        },
                        storyVideos: {
                            $map: {
                                input: '$storyVideos',
                                as: 'video',
                                in: {
                                    url: '$$video.url',
                                    secureUrl: '$$video.secureUrl'
                                }
                            }
                        },
                        createdBy: {
                            _id: "$createdByDetails._id",
                            username: '$createdByDetails.username',
                            profileImg: '$createdByDetails.profileImg',
                            profileImgSecureUrl: '$createdByDetails.profileImgSecureUrl'
                        }
                    }
                }
            ])
            if (!story || story.length === 0) {
                return reject(new Error('Story not found'));
            }    
            resolve(story[0])
        } catch (error) {
            reject(error);
        }
    })
}


const updateViewCount = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            await StorySchema.findByIdAndUpdate(id, { $inc: { views: 1 } })
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const addStoryLike = (storyId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Perform a single atomic update
            const updatedStory = await StorySchema.findOneAndUpdate(
                { _id: storyId },
                [
                    {
                        $set: {
                            likes: {
                                $cond: {
                                    if: { $in: [userId, '$likes'] }, // Check if userId exists in the likes array
                                    then: { $setDifference: ['$likes', [userId]] }, // Remove userId
                                    else: { $concatArrays: ['$likes', [userId]] } // Add userId
                                }
                            }
                        }
                    }
                ],
                { new: true } // Return the updated document
            );

            if (!updatedStory) {
                return reject(new Error('Story not found'));
            }

            resolve(updatedStory);
        } catch (error) {
            reject(error);
        }
    })
}

const getStories = (page, limit, filters) => {
    return new Promise(async(resolve, reject) => {
        try {
            const skip = (page - 1) * limit
            const matchStage = {
                $match: {}
            }
            if (filters.tripType) {
                const tripTypes = filters.tripType.split(',').map(type => type.trim());
                matchStage.$match.tripType = { $in: tripTypes };
            }

            // Add location filter
            if (filters.location) {
                matchStage.$match.location = { $regex: filters.location, $options: 'i' }; // Case-insensitive match
            }

            // Add transportation filter
            if (filters.transportation) {
                matchStage.$match.transportation = filters.transportation;
            }     
            
            // Add isMyStories filter
            if (filters.isMyStories && filters.createdBy) {
                matchStage.$match.createdBy = new mongoose.Types.ObjectId(String(filters.createdBy));
            }
            
            let sortStage = null;
            if (filters.sortBy === 'mostRecent') {
                sortStage = { $sort: { createdAt: -1 } }; // Sort by most recent (descending)
            } else if (filters.sortBy === 'mostPopular') {
                sortStage = { $sort: { likes: -1 } }; // Sort by most popular (descending)
            }

            const pipeline = [
                matchStage
            ]

            if (sortStage) pipeline.push(sortStage)
            
            pipeline.push ({
                $lookup: {
                    from: 'users', // The collection name for the User model
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByDetails'
                }
            },
            {
                $unwind: {
                    path: '$createdByDetails',
                    preserveNullAndEmptyArrays: true // In case the user is not found
                }
            },
            {
                $project: {
                    title: 1,
                    location: 1,
                    storyReadTime: 1,
                    likes: { $size: '$likes' },
                    views: 1,
                    totalComments: 1,
                    createdAt: 1,
                    coverImage: {
                        url: '$coverImage.url',
                        secureUrl: '$coverImage.secureUrl'
                    },
                    createdBy: {
                        _id: "$createdByDetails._id",
                        username: '$createdByDetails.username',
                        profileImg: '$createdByDetails.profileImg',
                        profileImgSecureUrl: '$createdByDetails.profileImgSecureUrl'
                    }
                }
            },
            {
                $facet: {
                    stories: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            },
            {
                $project: {
                    items: '$stories',
                    totalPages: {
                        $cond: {
                            if: { 
                                $gt: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] 
                            },
                            then: {
                                $ceil: {
                                    $divide: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit]
                                }
                            },
                            else: 0 // Fallback to 0 if there are no subcategories
                        }
                    },
                    hasNextPage: {
                        $gt: [{ $arrayElemAt: ['$totalCount.count', 0] }, skip + limit]
                    },
                    hasPreviousPage: { $gt: [skip, 0] }
                }
            })

            const stories = await StorySchema.aggregate(pipeline)            
            resolve(stories[0])
        } catch (error) {
            reject(error)
        }
    })
}

const addComment = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            const comment = await CommentSchema.create(data)
            await StorySchema.findByIdAndUpdate(data.storyId, { $inc: { totalComments: 1 } })
            resolve(comment)
        } catch (error) {
            reject(error)
        }
    })
}

const getComments = (page, limit, storyId) => {
    return new Promise(async(resolve, reject) => {
        try {
            const skip = (page - 1) * limit
            const commentsPipeline = await CommentSchema.aggregate([
                {
                    $match: {
                        storyId: new mongoose.Types.ObjectId(String(storyId))
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $lookup: {
                        from: 'users', // The collection name for the User model
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'createdByDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$createdByDetails',
                        preserveNullAndEmptyArrays: true // In case the user is not found
                    }
                },
                {
                    $project: {
                        content: 1,
                        createdAt: 1,
                        createdBy: {
                            _id: "$createdByDetails._id",
                            username: '$createdByDetails.username',
                            profileImg: '$createdByDetails.profileImg',
                            profileImgSecureUrl: '$createdByDetails.profileImgSecureUrl'
                        }
                    }
                },
                {
                    $facet: {
                        comments: [
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalCount: [
                            { $count: 'count' }
                        ]
                    }
                },
                {
                    $project: {
                        items: '$comments',
                        totalComments: { $arrayElemAt: ['$totalCount.count', 0] }, // Extract total count
                        totalPages: {
                            $cond: {
                                if: { 
                                    $gt: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] 
                                },
                                then: {
                                    $ceil: {
                                        $divide: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit]
                                    }
                                },
                                else: 0 // Fallback to 0 if there are no subcategories
                            }
                        },
                        hasNextPage: {
                            $gt: [{ $arrayElemAt: ['$totalCount.count', 0] }, skip + limit]
                        },
                        hasPreviousPage: { $gt: [skip, 0] }
                    }
                }
            ])
            resolve(commentsPipeline[0])
        } catch (error) {
            reject(error)
        }
    })
}

const saveStory = (userId, storyId, action) => {
    return new Promise(async(resolve, reject) => {
        try {
            let updateOperation;

            if (action === 'add') {
                // Add the storyId to the saved array
                updateOperation = { $addToSet: { saved: storyId } };
            } else if (action === 'remove') {
                // Remove the storyId from the saved array
                updateOperation = { $pull: { saved: storyId } };
            } else {
                return reject(new Error('Invalid action. Use "add" or "remove".'));
            }

            const result = await UserSchema.findByIdAndUpdate(
                userId,
                updateOperation,
                { new: true } // Return the updated document
            );

            if (!result) {
                return reject(new Error('User not found'));
            }

            resolve(result);
        } catch (error) {
            reject(error)
        }
    })
}

const deleteComment = (storyId, commentId, user) => {
    return new Promise(async(resolve, reject) => {
        try {
            const deletedComment = await CommentSchema.findOneAndDelete({
                _id: commentId,
                storyId,
                userId: user // Ensure the user deleting the comment is the owner
            });
            if (!deletedComment) {
                return reject(new Error('Comment not found or you do not have permission to delete this comment.'));
            }
            await StorySchema.findByIdAndUpdate(
                storyId,
                { $inc: { totalComments: -1 } }
            )
            resolve(true);
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getStory,
    updateViewCount,
    addStoryLike,
    getStories,
    addComment,
    getComments,
    saveStory,
    deleteComment
}
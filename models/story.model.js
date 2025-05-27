const mongoose = require('mongoose')

const Schema = mongoose.Schema

const storySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    coverImage: {
        url: String,
        secureUrl: String,
        publicId: String
    },
    storyImages: [
        {
            url: String,
            secureUrl: String,
            publicId: String
        }
    ],
    storyVideos: [
        {
            url: String,
            secureUrl: String,
            publicId: String
        }
    ],
    location: {
        type: String,
        required: true
    },
    locationMapLink: {
        type: String
    },
    budget: {
        type: Number,
        required: true
    },
    travelDate: {
        type: Date,
        required: true
    },
    storyReadTime: {
        type: String,
        required: true
    },
    tripType: {
        type: String,
        enum: ['solo', 'couple', 'family', 'friends', 'backpacking', 'adventure', 'luxury', 'cultural', 'business', 'girls trip',
            'guys trip',
            'pet-friendly',
            'multi-generational',
            'foodie',
            'historical',
            'wellness',
            'festival/event',
            'voluntourism',
            'educational',
            'ancestry/roots',
            'wildlife',
            'photography',
            'shopping',
            'pilgrimage/spiritual',
            'concert/music',
            'sports',
            'road trip',
            'workation',
            'hiking/trekking',
            'camping',
            'skiing/snowboarding',
            'diving/snorkeling',
            'surfing',
            'climbing/mountaineering',
            'cycling/bike touring',
            'kayaking/canoeing/rafting',
            'sailing/boating',
            'cruising',
            'motorcycle touring',
            'relaxation',
            'fast-paced',
            'slow travel',
            'off-the-beaten-path',
            'budget',
            'sustainable/eco-tourism',
            'glamping',
            'resort stay',
            'hostel hopping',
            'homestay',
            'cabin/lodge',
            'rv/campervan',
            'beach',
            'mountains',
            'city break',
            'desert',
            'island hopping',
            'lake',
            'jungle/rainforest',
            'arctic/antarctic', 'other'],
        required: true
    },
    transportation: {
        type: String,
        enum: ['car', 'bus', 'train', 'flight', 'boat', 'bicycle', 'walking', 'other'],
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    tips: [],
    highlights: [],
    storyType: {
        type: String,
        enum: ['private', 'public'],
        default: 'public'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Story', storySchema, 'stories')
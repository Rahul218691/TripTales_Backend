const multer = require('multer')
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadImage = (file, folder) => {
    return new Promise((resolve, reject) => {
        try {
            const fileArray = Array.isArray(file) ? file : [file]
            const uploadPromise = fileArray.map((f) => {
                return new Promise((resolveFile, rejectFile) => {
                    cloudinary.uploader.upload_stream({ 
                        resource_type: 'auto',
                        folder
                    }, (error, result) => {
                        if (error) return rejectFile(error)
                        if (result) resolveFile(result)
                    }).end(f.buffer)
                })
            })
            Promise.all(uploadPromise)
            .then((results) => resolve(results))
            .catch((err) => reject(err))
        } catch (error) {
            reject(error)
        }
    })
}

const deleteResource = (publicIds) => {
    return new Promise((resolve, reject) => {
        try {
            const deletePromises = publicIds.map((publicId) => {
                return new Promise((resolveDelete, rejectDelete) => {
                    cloudinary.uploader.destroy(publicId, (error, result) => {
                        if (error) {
                            rejectDelete(error)
                        } else {
                            resolveDelete(result)
                        }
                    })
                })
            })
            Promise.all(deletePromises)
            .then((res) => resolve(res))
            .catch((err) => reject(err))
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    upload,
    uploadImage,
    deleteResource
}
const multer = require('multer')
const cloudinary = require('cloudinary').v2;
const path = require('path')
const fs = require('fs')

const isDevelopment = process.env.ENVIRONMENT === 'development';

const uploadPath = !isDevelopment
  ? '/tmp/uploads'
  : path.join(__dirname, '../uploads');

// Ensure the upload folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.memoryStorage();

const diskStore = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Set the filename to include the original name and a timestamp
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
})

const upload = multer({ storage: storage, limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB per file
}});

const diskUpload = multer({
    storage: diskStore,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
})

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
    deleteResource,
    diskUpload
}
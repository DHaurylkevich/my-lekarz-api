const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { extractPublicId } = require("cloudinary-build-url");
const logger = require("../utils/logger");

const storageImages = new CloudinaryStorage({
    cloudinary,
    secure: true,
    params: {
        folder: "uploads/images",
        allowedFormats: ["jpeg", "png", "jpg"],
        transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto", fetch_format: "auto" }
        ],
        resource_type: "image",
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    },
});

const storageFiles = new CloudinaryStorage({
    cloudinary,
    secure: true,
    params: {
        folder: "uploads/files",
        allowedFormats: ["pdf", "doc", "docx"],
        resource_type: "raw",
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    },
});

exports.deleteFromCloud = async (url) => {
    try {
        let publicId = extractPublicId(url);

        if (publicId.includes("files")) {
            await cloudinary.api.delete_resources([publicId], { type: 'upload', resource_type: 'raw' });
        } else {
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (err) {
        logger.error("cloudinary.deleteFromCloud Error")
        throw err;
    }
};

exports.uploadImages = multer({ storage: storageImages });
exports.uploadFiles = multer({ storage: storageFiles });

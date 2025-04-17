"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = exports.uploadOnClodinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
// Configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Update to handle file buffer
const uploadToCloudinary = async (fileBuffer, fileType) => {
    try {
        if (!fileBuffer)
            return null;
        return new Promise((resolve, reject) => {
            // Create upload stream
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                // console.log("File uploaded to Cloudinary:", result?.url);
                resolve(result?.url);
            });
            // Convert buffer to readable stream and pipe to upload stream
            const readableStream = new stream_1.Readable({
                read() {
                    this.push(fileBuffer);
                    this.push(null);
                }
            });
            readableStream.pipe(uploadStream);
        });
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
// Keep backward compatibility for any code still using the old function
const uploadOnClodinary = async (input) => {
    if (typeof input === 'string') {
        // Handle file path (for backward compatibility)
        try {
            if (!input)
                return null;
            const uploadResult = await cloudinary_1.v2.uploader.upload(input, {
                resource_type: "auto",
            });
            // console.log("File is Uploaded on cloudinary", uploadResult.url);
            return uploadResult.url;
        }
        catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            return null;
        }
    }
    else {
        // Handle buffer
        return uploadToCloudinary(input, 'auto');
    }
};
exports.uploadOnClodinary = uploadOnClodinary;

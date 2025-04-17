import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Update to handle file buffer
const uploadToCloudinary = async (fileBuffer: Buffer, fileType: string) => {
  try {
    if (!fileBuffer) return null;
    
    return new Promise((resolve, reject) => {
      // Create upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          // console.log("File uploaded to Cloudinary:", result?.url);
          resolve(result?.url);
        }
      );
      
      // Convert buffer to readable stream and pipe to upload stream
      const readableStream = new Readable({
        read() {
          this.push(fileBuffer);
          this.push(null);
        }
      });
      
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

// Keep backward compatibility for any code still using the old function
const uploadOnClodinary = async (input: string | Buffer) => {
  if (typeof input === 'string') {
    // Handle file path (for backward compatibility)
    try {
      if (!input) return null;
      const uploadResult = await cloudinary.uploader.upload(input, {
        resource_type: "auto",
      });
      // console.log("File is Uploaded on cloudinary", uploadResult.url);
      return uploadResult.url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    }
  } else {
    // Handle buffer
    return uploadToCloudinary(input, 'auto');
  }
};

export { uploadOnClodinary, uploadToCloudinary };
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // timeout: 120000 
});

// Update to handle file buffer
const uploadToCloudinary = async (fileBuffer: Buffer, fileType: string) => {
  // Log input parameters for debugging
  // console.log(`Uploading file. Type: ${fileType}, Size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);

  // Basic validation for fileType
  if (!fileType || typeof fileType !== 'string') {
     console.error("Invalid or missing fileType provided.");
     return Promise.reject(new Error("Invalid file type provided for upload."));
  }

  try {
    if (!fileBuffer) {
       console.warn("uploadToCloudinary called with null or empty buffer.");
       return null;
    }

    // Check file size against Cloudinary limit (e.g., 10MB free tier)
    const maxSizeMB = 100;
    if (fileBuffer.length > maxSizeMB * 1024 * 1024) {
       console.error(`File size (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB) exceeds the Cloudinary limit of ${maxSizeMB} MB.`);
       return Promise.reject(new Error(`File too large for Cloudinary plan. Maximum size is ${maxSizeMB}MB.`));
    }

    return new Promise((resolve, reject) => {
      // Create upload stream with resource_type: "auto"
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video", // Explicitly tell Cloudinary to detect type
          timeout: 120000,       // Set stream-specific timeout
          chunk_size: 6000000,   // Optional: Chunking for potentially better reliability
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload callback error:", JSON.stringify(error, null, 2));
            // Provide a more specific error message if possible
            let errorMessage = "Cloudinary upload failed.";
            if (error.message) {
                errorMessage += ` Details: ${error.message}`;
            }
            if (error.http_code) {
                errorMessage += ` (HTTP ${error.http_code})`;
            }
             // Reject with a new Error object for better stack traces
            return reject(new Error(errorMessage));
          }
          // Log success result for confirmation
          // console.log("Cloudinary upload successful. Result:", result?.resource_type, result?.format, result?.secure_url);
          // Resolve with the secure URL (preferable) or regular URL
          resolve(result?.secure_url || result?.url);
        }
      );

      // Handle errors on the upload stream itself
      uploadStream.on('error', (error) => {
         console.error("Error event emitted on Cloudinary upload stream:", error);
         // Ensure the promise is rejected if the stream emits an error
         reject(new Error(`Upload stream error: ${error.message}`));
      });

      // Pipe the buffer to the upload stream
      Readable.from(fileBuffer).pipe(uploadStream);

      // Note: .end(fileBuffer) is also valid, but piping from Readable is common
      // uploadStream.end(fileBuffer); // This also works if Readable.from causes issues

    });
  } catch (error) {
    // Catch synchronous errors or rejections from the promise
    console.error("Error within uploadToCloudinary function:", error);
    // Ensure a null is returned or the error is propagated
    return null; // Or throw error;
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
        // timeout: 120000, // 2 minutes timeout
        chunk_size: 5000000 // 6MB chunks
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
import multer from "multer";

//method from the multer library is used to configure disk-based storage for uploaded files. Instead of storing the files in memory
//changed to memory storage to store files in memory 
const storage = multer.memoryStorage();

export const upload = multer({ storage,limits: {
   fileSize: 100 * 1024 * 1024, // 100MB limit (adjust as needed)
 } });

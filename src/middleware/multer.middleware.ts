import multer from "multer";

//method from the multer library is used to configure disk-based storage for uploaded files. Instead of storing the files in memory
const storage = multer.diskStorage({
	//This function specifies the directory where the uploaded files will be stored on the server.
	destination: function (req, file, cb) {
		// A callback function that multer will use to handle errors or specify the destination.
		cb(null, "./public/temp");
	},
	//specifies how the uploaded file's name should be saved
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

export const upload = multer({ storage });

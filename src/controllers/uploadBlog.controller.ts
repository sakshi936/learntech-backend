import { Request, Response } from "express";
import { BlogModel } from "../models/blogs.modal";
import { uploadOnClodinary } from "../utils/cloudinary.service";
// Create a new blog
export const uploadBlog = async (req: Request, res: Response): Promise<void> => {
	try {
	  const { title, description, mediaType, author } = req.body;
	  
	  // Basic validation
	  if (!title || !description || !mediaType || !author) {
		 res.status(400).json({ message: "All fields are required." });
		 return;
	  }
	  
	  let blogPublicUrl;
	  
	  // Handle file from multer memory storage
	  if (req.file) {
		 // Use the buffer directly
		 blogPublicUrl = await uploadOnClodinary(req.file.buffer);
	  } else if (req.body.mediaUrl) {
		 // For text-only submissions or URL submissions
		 blogPublicUrl = req.body.mediaUrl;
	  } else {
		 res.status(400).json({ message: "Media file is required." });
		 return;
	  }
	  
	  if (!blogPublicUrl) {
		 res.status(500).json({ message: "Failed to upload media to cloud storage." });
		 return;
	  }
	  
	  // Create and save the blog
	  const newBlog = new BlogModel({
		 title,
		 description,
		 mediaType,
		 mediaUrl: blogPublicUrl,
		 author,
	  });
	  
	  await newBlog.save();
	  
	  res.status(201).json({
		 success: true,
		 message: "Blog created successfully",
		 blog: newBlog,
	  });
	  
	} catch (error) {
	  console.error("Error creating blog:", error);
	  res.status(500).json({ 
		 success: false, 
		 message: "Server error", 
		 error: error instanceof Error ? error.message : String(error)
	  });
	}
 };

// get all blogs
export const getAllBlogs = async (req: Request, res: Response) => {
	try {
		const blogs = await BlogModel.find().sort({ createdAt: -1 }); // latest first
		res.status(200).json({
			success: true,
			count: blogs.length,
			data: blogs,
		});
	} catch (error) {
		console.error("Error fetching blogs:", error);
		res.status(500).json({ message: "Failed to fetch blogs" });
	}
};

// Delete blog
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		// console.log("DELETE request received for ID:", req.params.id);

		const blog = await BlogModel.findById(req.params.id);
		if (!blog) {
			res.status(404).json({ message: "Blog not found" });
			return;
		}

		await BlogModel.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Blog deleted successfully" });
	} catch (error) {
		console.error("Delete Error:", error);
		res.status(500).json({ message: "Failed to delete blog" });
	}
};

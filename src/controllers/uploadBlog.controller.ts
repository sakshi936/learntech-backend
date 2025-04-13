import { Request, Response } from "express";
import { BlogModel } from "../models/blogs.modal";
import { uploadOnClodinary } from "../utils/cloudinary.service";
// Create a new blog
export const uploadBlog = async (req: Request, res: Response): Promise<void> => {
	try {
		const { title, description, mediaType, author } = req.body;
		const mediaUrl = req.file?.path || req.body.mediaUrl;

		// console.log(mediaUrl);

		if (!title || !description || !mediaType || !mediaUrl || !author) {
			res.status(400).json({ message: "All fields are required." });
			return;
		}
		// console.log("Received Blog Data:", { title, description, mediaType, mediaUrl, author });

		const blogPublicUrl = await uploadOnClodinary(mediaUrl);
		if (!blogPublicUrl) res.status(404).json({ message: "failed to upload blog on cloudnary" });

		const newBlog = new BlogModel({
			title,
			description,
			mediaType,
			mediaUrl: blogPublicUrl,
			author,
		});

		await newBlog.save();

		console.log(newBlog);

		res.status(201).json({
			message: "Blog created successfully",
			blog: newBlog,
		});
	} catch (error) {
		console.error("Error creating blog:", error);
		res.status(500).json({ message: "Server error" });
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
		console.log("DELETE request received for ID:", req.params.id);

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

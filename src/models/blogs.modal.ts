import { timeStamp } from "console";
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},

		mediaType: {
			type: String, // 'image', 'text' or 'video'
			enum: [ "text", "video"],
			required: true,
		},

		mediaUrl: {
			type: String, // cloud or local URL
			required: true,
		},
		author: {
			// type: mongoose.Schema.Types.ObjectId,
			// ref: "UserProfileModel",
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);
export const BlogModel = mongoose.model("Blog", blogSchema);

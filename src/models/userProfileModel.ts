import mongoose, { Schema } from "mongoose";
import { UserProfile } from "../types/types";

const UserProfileSchema: Schema<UserProfile> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
  },
  course: { type: String, required: true },
  phone: { type: String, required: true },
  collegeName: { type: String, required: true },
  skills: { type: [String], required: true },
});

const UserProfileModel =
  mongoose.models.UserProfile ||
  mongoose.model<UserProfile>("UserProfile", UserProfileSchema);

export default UserProfileModel;

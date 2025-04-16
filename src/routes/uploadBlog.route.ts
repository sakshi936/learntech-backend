import { Router } from "express";
import { deleteBlog, getAllBlogs, uploadBlog } from "../controllers/uploadBlog.controller";
import { upload } from "../middleware/multer.middleware";
const router = Router();

router.post("/upload", upload.single("mediaUrl"), uploadBlog);
router.get("/blogs", getAllBlogs);
router.delete("/deleteblog/:id", deleteBlog);
export default router;

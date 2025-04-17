"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadBlog_controller_1 = require("../controllers/uploadBlog.controller");
const multer_middleware_1 = require("../middleware/multer.middleware");
const router = (0, express_1.Router)();
router.post("/upload", multer_middleware_1.upload.single("mediaUrl"), uploadBlog_controller_1.uploadBlog);
router.get("/blogs", uploadBlog_controller_1.getAllBlogs);
router.delete("/deleteblog/:id", uploadBlog_controller_1.deleteBlog);
exports.default = router;

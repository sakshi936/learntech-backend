import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController";
import { authenticateToken } from "../middleware/authenticateToken";

const router = Router();

// Protected routes that require authentication
router.get("/get-profile", authenticateToken, getProfile);
router.post("/update-profile", authenticateToken, updateProfile);

export default router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const authenticateToken_1 = require("../middleware/authenticateToken");
const router = (0, express_1.Router)();
// Protected routes that require authentication
router.get("/get-profile", authenticateToken_1.authenticateToken, profileController_1.getProfile);
router.post("/update-profile", authenticateToken_1.authenticateToken, profileController_1.updateProfile);
exports.default = router;

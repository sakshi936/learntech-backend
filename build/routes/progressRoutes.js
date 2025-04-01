"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/progressRoutes.ts
const express_1 = __importDefault(require("express"));
const progressController_1 = require("../controllers/progressController");
const authenticateToken_1 = require("../middleware/authenticateToken");
const router = express_1.default.Router();
router.get('/all', authenticateToken_1.authenticateToken, progressController_1.getAllProgress);
router.get('/stats', authenticateToken_1.authenticateToken, progressController_1.getProgressStats);
router.get('/:roadmapSlug', authenticateToken_1.authenticateToken, progressController_1.getProgress);
router.post('/:roadmapSlug', authenticateToken_1.authenticateToken, progressController_1.updateProgress);
exports.default = router;

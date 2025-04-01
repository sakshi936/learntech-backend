"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/roadmapRoutes.ts
const express_1 = __importDefault(require("express"));
const roadmapController_1 = require("../controllers/roadmapController");
const router = express_1.default.Router();
router.get('/', roadmapController_1.getAllRoadmaps);
router.get('/:slug', roadmapController_1.getRoadmapBySlug);
exports.default = router;

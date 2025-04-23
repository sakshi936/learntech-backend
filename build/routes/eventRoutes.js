"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const authenticateToken_1 = require("../middleware/authenticateToken");
const router = (0, express_1.Router)();
router.post("/", authenticateToken_1.authenticateToken, eventController_1.createEvent); // Create a new event
router.get("/", authenticateToken_1.authenticateToken, eventController_1.getEvents); // Get all events
exports.default = router;

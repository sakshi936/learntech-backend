import e, { Router } from "express";
import { createEvent, getEvents } from "../controllers/eventController";
import { authenticateToken } from "../middleware/authenticateToken";

const router = Router();

router.post("/",authenticateToken, createEvent); // Create a new event
router.get("/",authenticateToken, getEvents); // Get all events

export default router;
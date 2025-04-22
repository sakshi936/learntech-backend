"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = void 0;
const eventModel_1 = require("../models/eventModel");
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, organizer, imageUrl } = req.body;
        const { role } = req.user;
        if (role !== 'admin') {
            res.status(403).json({ message: 'Only admins can create events' });
            return;
        }
        if (!title || !description || !date) {
            res.status(400).json({ message: 'Title, description, and date are required' });
            return;
        }
        const newEvent = new eventModel_1.EventModel({
            title,
            description,
            date,
            location,
            organizer,
            imageUrl,
        });
        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
};
exports.createEvent = createEvent;

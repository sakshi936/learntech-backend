import { Request, Response } from 'express';
import { EventModel } from '../models/eventModel';

export const createEvent = async (req: Request, res: Response) => {
   try {
      const { title, description, date, location, organizer, imageUrl } = req.body;
      const { role } = req.user; 
      if (role !== 'admin') {
         res.status(403).json({ message: 'Only admins can create events' });
         return
      }

      if (!title || !description || !date) {
         res.status(400).json({ message: 'Title, description, and date are required' });
         return 
      }
   
      const newEvent = new EventModel({
         title,
         description,
         date,
         location,
         organizer,
         imageUrl,
      });
   
      await newEvent.save();
   
      res.status(201).json({ message: 'Event created successfully', event: newEvent });
   } catch (error) {
      res.status(500).json({ message: 'Error creating event', error });
   }
}

export const getEvents = async (req: Request, res: Response) => {
   try {
      const events = await EventModel.find();
      res.status(200).json(events);
   } catch (error) {
      res.status(500).json({ message: 'Error fetching events', error });
   }
}


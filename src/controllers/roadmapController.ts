// src/controllers/roadmapController.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Roadmap from '../models/roadmapModel';

// Get all roadmaps
export const getAllRoadmaps = async (req: Request, res: Response) => {
  try {
    const roadmaps = await Roadmap.find().select('-__v');
    res.status(200).json({ success: true, data: roadmaps });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get roadmap by slug
//currently not used in the frontend, but let's keep it
export const getRoadmapBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Find roadmap metadata
    const roadmap = await Roadmap.findOne({ slug });
    if (!roadmap) {
       res.status(404).json({ success: false, message: 'Roadmap not found' });
       return 
    }
    
    // Load roadmap structure from JSON file
    const filePath = path.join(process.cwd(), 'src','data', 'roadmaps', `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Roadmap structure not found' });
      return 
    }
    
    const structureData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Combine metadata and structure
    const result = {
      ...roadmap.toObject(),
      structure: structureData
    };
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

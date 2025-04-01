import Roadmap from '../models/roadmapModel';
import dbConnect from '../db/dbConnect';
import fs from 'fs';
import path from 'path';

const initRoadmaps = async () => {
  await dbConnect();
  
  // Load roadmap metadata from JSON file
  const metadataPath = path.join(__dirname, '../data/index.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  // Create roadmaps in database
  for (const roadmap of metadata.roadmaps) {
    const { slug, title, description, category, difficulty } = roadmap;
    
    // Check if roadmap exists
    const existing = await Roadmap.findOne({ slug });
    if (!existing) {
      // Create structure file if it doesn't exist
      const structurePath = path.join(__dirname, `../data/roadmaps/${slug}.json`);
      if (!fs.existsSync(structurePath)) {
        // Get structure from data.json for now
        const allStructures = JSON.parse(
          fs.readFileSync(path.join(__dirname, '../data/data.json'), 'utf8')
        );
        
        const structure = allStructures[slug] || {};
        fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2), 'utf8');
      }
      
      // Calculate total items
      const structure = JSON.parse(fs.readFileSync(structurePath, 'utf8'));
      let totalItems = 0;
      
      for (const level in structure) {
        for (const tech in structure[level]) {
          for (const topic in structure[level][tech]) {
            totalItems += structure[level][tech][topic].length;
          }
        }
      }
      
      // Create new roadmap
      await Roadmap.create({
        slug,
        title,
        description,
        
      });
      
      console.log(`Created roadmap: ${title}`);
    }
  }
  
  console.log('Roadmap initialization complete');
  process.exit(0);
};

initRoadmaps().catch(err => {
  console.error('Error initializing roadmaps:', err);
  process.exit(1);
});
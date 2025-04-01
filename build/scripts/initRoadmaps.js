"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const roadmapModel_1 = __importDefault(require("../models/roadmapModel"));
const dbConnect_1 = __importDefault(require("../db/dbConnect"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const initRoadmaps = async () => {
    await (0, dbConnect_1.default)();
    // Load roadmap metadata from JSON file
    const metadataPath = path_1.default.join(__dirname, '../data/index.json');
    const metadata = JSON.parse(fs_1.default.readFileSync(metadataPath, 'utf8'));
    // Create roadmaps in database
    for (const roadmap of metadata.roadmaps) {
        const { slug, title, description, category, difficulty } = roadmap;
        // Check if roadmap exists
        const existing = await roadmapModel_1.default.findOne({ slug });
        if (!existing) {
            // Create structure file if it doesn't exist
            const structurePath = path_1.default.join(__dirname, `../data/roadmaps/${slug}.json`);
            if (!fs_1.default.existsSync(structurePath)) {
                // Get structure from data.json for now
                const allStructures = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../data/data.json'), 'utf8'));
                const structure = allStructures[slug] || {};
                fs_1.default.writeFileSync(structurePath, JSON.stringify(structure, null, 2), 'utf8');
            }
            // Calculate total items
            const structure = JSON.parse(fs_1.default.readFileSync(structurePath, 'utf8'));
            let totalItems = 0;
            for (const level in structure) {
                for (const tech in structure[level]) {
                    for (const topic in structure[level][tech]) {
                        totalItems += structure[level][tech][topic].length;
                    }
                }
            }
            // Create new roadmap
            await roadmapModel_1.default.create({
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

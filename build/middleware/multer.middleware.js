"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
//method from the multer library is used to configure disk-based storage for uploaded files. Instead of storing the files in memory
//changed to memory storage to store files in memory 
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage, limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit (adjust as needed)
    } });

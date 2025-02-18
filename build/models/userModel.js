"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: [true, 'Username is required'], trim: true, unique: true },
    //match matches the email with the regex
    email: { type: String, required: [true, 'Email is required'], unique: true, match: [/\S+@\S+\.\S+/, 'Please enter a valid email'] },
    password: { type: String, required: [true, 'Password is required'] },
    verifyCode: { type: String, required: [true, 'Verification code is required'] },
    isVerified: { type: Boolean, default: false },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student',
        required: [true, 'Role is required']
    },
    verifyCodeExpiry: { type: Date, required: [true, "Code Expiry is required"], default: Date.now }
});
const UserModel = (mongoose_1.default.models.User) || mongoose_1.default.model('User', UserSchema);
exports.default = UserModel;
